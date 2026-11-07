import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cropper from 'react-easy-crop'
import Container from './ui/Container'
import { fadeUp, scaleIn, VIEWPORT_ONCE } from '@/lib/animations'
import { supabase } from '@/lib/supabase'
import { eventDate, eventVenuePhysical, eventVenueVirtual } from '@/content/siteContent'
import type { RegistrationFormErrors, TicketData, AttendanceMode } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────
interface PixelCrop { x: number; y: number; width: number; height: number }

// ─── Crop engine — never produces zero ───────────────────────────────────────
//
// Strategy: load the image fresh (blob URL → naturalWidth/Height), then
// compute the visible square from zoom + cropPos entirely in math.
// react-easy-crop's onCropComplete gives us a hint; if it's invalid
// (width < 10) we fall back to a centered square at the current zoom.
//
// cropPos is in display-pixels relative to the image center inside the
// 400-px-tall container. We convert to natural-image coordinates here.
//
function buildCroppedDataUrl(
  blobUrl: string,
  zoom: number,
  cropPos: { x: number; y: number },
  hintPx: PixelCrop | null,
): Promise<string> {
  const OUT = 400        // output canvas size (square)
  const CONTAINER_H = 400  // fixed container height we set in the DOM

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const natW = img.naturalWidth
      const natH = img.naturalHeight
      console.log('[crop] natural size:', natW, '×', natH, '| zoom:', zoom)

      let sx: number, sy: number, sw: number, sh: number

      // ── Use the hint from onCropComplete if it looks valid ──
      if (
        hintPx &&
        hintPx.width  > 10 &&
        hintPx.height > 10 &&
        hintPx.x >= 0 &&
        hintPx.y >= 0 &&
        hintPx.x + hintPx.width  <= natW + 1 &&
        hintPx.y + hintPx.height <= natH + 1
      ) {
        sx = hintPx.x
        sy = hintPx.y
        sw = hintPx.width
        sh = hintPx.height
        console.log('[crop] using hintPx:', sx, sy, sw, sh)
      } else {
        // ── Math fallback: derive from zoom + cropPos ──
        // The container is CONTAINER_H px tall, square crop area ≈ min(container)
        // react-easy-crop shows the image scaled so the shorter side fits CONTAINER_H.
        // The rendered image size at zoom=1:
        const aspect = natW / natH
        let rendW: number, rendH: number
        if (aspect >= 1) {
          // landscape: height fits container
          rendH = CONTAINER_H
          rendW = rendH * aspect
        } else {
          // portrait: width fits container
          rendW = CONTAINER_H
          rendH = rendW / aspect
        }

        // At current zoom the rendered size is:
        const scaledW = rendW * zoom
        const scaledH = rendH * zoom

        // The crop area (square circle) is CONTAINER_H × CONTAINER_H
        const cropDisplaySize = CONTAINER_H   // 400px square crop window

        // cropPos.x/y = pixels the image is panned (negative = panned left)
        // Image center in display space = scaledW/2 + cropPos.x
        // Visible crop starts at image center - cropDisplaySize/2
        const cropDisplayLeft = scaledW / 2 - cropDisplaySize / 2 - cropPos.x
        const cropDisplayTop  = scaledH / 2 - cropDisplaySize / 2 - cropPos.y

        // Convert from display-space to natural-image-space
        const displayToNatX = natW / scaledW
        const displayToNatY = natH / scaledH

        sx = cropDisplayLeft * displayToNatX
        sy = cropDisplayTop  * displayToNatY
        sw = cropDisplaySize * displayToNatX
        sh = cropDisplaySize * displayToNatY

        console.log('[crop] math fallback: sx', sx.toFixed(1), 'sy', sy.toFixed(1),
          'sw', sw.toFixed(1), 'sh', sh.toFixed(1))
      }

      // ── Clamp to image bounds ──
      sx = Math.max(0, sx)
      sy = Math.max(0, sy)
      sw = Math.min(sw, natW - sx)
      sh = Math.min(sh, natH - sy)

      // ── Last-resort: if still zero, use full centered square ──
      if (sw < 10 || sh < 10) {
        const side = Math.min(natW, natH)
        sx = (natW - side) / 2
        sy = (natH - side) / 2
        sw = side
        sh = side
        console.warn('[crop] using full-image fallback, side=', side)
      }

      console.log('[crop] final rect:', sx.toFixed(0), sy.toFixed(0), sw.toFixed(0), sh.toFixed(0))

      // ── Draw into 400×400 canvas ──
      const canvas = document.createElement('canvas')
      canvas.width  = OUT
      canvas.height = OUT
      const ctx = canvas.getContext('2d')!

      // Circular clip so the exported PNG has a transparent background outside
      ctx.beginPath()
      ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2)
      ctx.clip()

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUT, OUT)

      const result = canvas.toDataURL('image/png')
      console.log('[crop] base64 PNG length:', result.length, '✓')

      if (result.length < 1000) {
        reject(new Error('Canvas export is empty — try a different photo.'))
        return
      }

      resolve(result)
    }

    img.onerror = () => reject(new Error('Photo failed to load. Please try again.'))
    img.src = blobUrl
  })
}

// ─── Validation ──────────────────────────────────────────────────────────────
const MB      = 1024 * 1024
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phoneRe = /^(\+?234|0)[789][01]\d{8}$/

const validateName  = (v: string) => v.trim().length >= 2 ? '' : 'Please enter your full name.'
const validateEmail = (v: string) => emailRe.test(v.trim()) ? '' : 'Enter a valid email address.'
const validatePhone = (v: string) => {
  const c = v.replace(/[\s\-()]/g, '')
  return phoneRe.test(c) ? '' : 'Enter a valid 11-digit Nigerian number (e.g. 08012345678).'
}

// ─── Ticket ID ────────────────────────────────────────────────────────────────
const genTicketId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let s = ''
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `RTYF-2026-${s}`
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  initialMode?: AttendanceMode | null
  onTicketGenerated: (t: TicketData) => void
}

// ─────────────────────────────────────────────────────────────────────────────
const RegistrationForm: React.FC<Props> = ({ initialMode, onTicketGenerated }) => {

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [mode,     setMode]     = useState<AttendanceMode | null>(initialMode ?? null)
  const [consent,  setConsent]  = useState(true)

  const [errs,    setErrs]    = useState<RegistrationFormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Photo / crop state
  const [blobUrl,   setBlobUrl]   = useState<string | null>(null)
  const [cropPos,   setCropPos]   = useState({ x: 0, y: 0 })
  const [zoom,      setZoom]      = useState(1)
  // hint from react-easy-crop — may be zero on first render, that's OK
  const [hintPx,    setHintPx]    = useState<PixelCrop | null>(null)
  const [cropStep,  setCropStep]  = useState<'idle'|'cropping'|'done'>('idle')
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [photoErr,  setPhotoErr]  = useState('')
  const [cropBusy,  setCropBusy]  = useState(false)

  // Submit state
  const [loading,   setLoading]   = useState(false)
  const [submitErr, setSubmitErr] = useState('')

  // File inputs OUTSIDE the form — prevents Android file-picker → form submit bug
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef  = useRef<HTMLInputElement>(null)

  // Sync mode from EventDetails card click
  useEffect(() => { if (initialMode) setMode(initialMode) }, [initialMode])

  // ── Form readiness ────────────────────────────────────────────────────────
  const nameOk    = fullName.trim().length >= 2
  const emailOk   = emailRe.test(email.trim())
  const phoneOk   = phoneRe.test(phone.replace(/[\s\-()]/g, ''))
  const modeOk    = !!mode
  const photoOk   = cropStep === 'done' && !!photoData
  const canSubmit = nameOk && emailOk && phoneOk && modeOk && photoOk && consent && !loading

  // ── Blur validators ───────────────────────────────────────────────────────
  const blurName  = () => { setTouched(t=>({...t,name:true}));  setErrs(e=>({...e,fullName:validateName(fullName)||undefined})) }
  const blurEmail = () => { setTouched(t=>({...t,email:true})); setErrs(e=>({...e,email:   validateEmail(email)  ||undefined})) }
  const blurPhone = () => { setTouched(t=>({...t,phone:true})); setErrs(e=>({...e,phone:   validatePhone(phone)  ||undefined})) }

  // ── Photo file handler ────────────────────────────────────────────────────
  // ── Photo file handler ────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''          // allow re-selecting same file
    if (!file) return

    console.log('[photo] file:', file.name, file.type, `${(file.size/MB).toFixed(2)}MB`)

    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) {
      setPhotoErr('Please upload a JPG, PNG or WebP image.'); return
    }

    setPhotoErr('')
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setBlobUrl(URL.createObjectURL(file))
    setPhotoData(null)
    setCropStep('cropping')
    setCropPos({ x: 0, y: 0 })
    setZoom(1)
    setHintPx(null)
  }

  // ── Crop complete (store react-easy-crop hint) ─────────────────────────────
  const onCropComplete = useCallback(
    (_croppedArea: PixelCrop, croppedAreaPixels: PixelCrop) => setHintPx(croppedAreaPixels),
    [],
  )

  // ── Crop confirm ("Use This Photo") ────────────────────────────────────────
  const handleUseFace = async () => {
    if (!blobUrl) return
    setCropBusy(true)
    setPhotoErr('')
    try {
      const data = await buildCroppedDataUrl(blobUrl, zoom, cropPos, hintPx)
      setPhotoData(data)
      setCropStep('done')
      console.log('[crop] ✓ photo saved, length:', data.length)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not process photo.'
      console.error('[crop] error:', msg)
      setPhotoErr(msg)
    } finally {
      setCropBusy(false)
    }
  }

  // ── Remove / re-crop ──────────────────────────────────────────────────────
  const handleRemovePhoto = () => {
    if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null) }
    setPhotoData(null)
    setCropStep('idle')
    setPhotoErr('')
    setCropPos({ x: 0, y: 0 })
    setZoom(1)
    setHintPx(null)
  }

  // ── Generate ticket + SEND EMAIL ──────────────────────────────────────────
  // Uses onClick on a type="button" — never type="submit" — so no form
  // submission fires under any circumstance.
  const handleGenerate = async () => {
    setTouched({ name: true, email: true, phone: true })

    const newErrs: RegistrationFormErrors = {}
    const ne = validateName(fullName);  if (ne) newErrs.fullName = ne
    const ee = validateEmail(email);    if (ee) newErrs.email    = ee
    const pe = validatePhone(phone);    if (pe) newErrs.phone    = pe
    if (!mode) newErrs.attendanceMode = 'Please select an attendance mode.'
    if (!photoData) { setSubmitErr('Please upload a profile photo to continue.'); return }

    if (Object.keys(newErrs).length) { setErrs(newErrs); return }

    setLoading(true); setSubmitErr('')
    try {
      await new Promise(r => setTimeout(r, 400))

      const safePhoto = photoData?.startsWith('data:image') ? photoData : null
      const newTicketId = genTicketId()

      // ── STEP 1: Photo upload — NON-BLOCKING ──────────────────────────────
      // Always starts with a placeholder. If the upload succeeds we swap it in.
      // Any failure is silently swallowed; the rest of the flow always continues.
      let photoStorageUrl = 'https://via.placeholder.com/150'
      try {
        if (safePhoto) {
          const [meta, b64] = safePhoto.split(',')
          const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
          const bin = atob(b64)
          const bytes = new Uint8Array(bin.length)
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
          const blob = new Blob([bytes], { type: mime })
          const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png'
          const fileName = `${newTicketId}-${Date.now()}.${ext}`
          const { error: upErr } = await supabase.storage
            .from('photos')
            .upload(fileName, blob, { contentType: mime })
          if (upErr) {
            console.warn('Photo upload failed, using placeholder:', upErr.message)
          } else {
            const { data: pub } = supabase.storage.from('photos').getPublicUrl(fileName)
            photoStorageUrl = pub.publicUrl
          }
        }
      } catch (photoErr) {
        console.warn('Photo upload threw, using placeholder:', photoErr)
      }

      // ── STEP 2: Insert registration row ──────────────────────────────────
      const { data, error } = await supabase
        .from('registrations')
        .insert([{
          name:        fullName.trim(),
          email:       email.trim().toLowerCase(),
          phone:       phone.trim(),
          ticket_type: mode === 'virtual' ? 'Virtual' : 'In Person',
          ticket_id:   newTicketId,
          photo_url:   photoStorageUrl,
          created_at:  new Date().toISOString(),
        }])
        .select()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('DB insert error:', error)
        setSubmitErr('Registration failed: ' + error.message)
        return
      }

      // ── STEP 3: Build local ticket object ─────────────────────────────────
      const ticketData = {
        ticketNumber:   newTicketId,
        fullName:       fullName.trim(),
        email:          email.trim().toLowerCase(),
        phone:          phone.trim(),
        photoUrl:       safePhoto,          // base64 — used for canvas rendering
        attendanceMode: mode as AttendanceMode,
        generatedAt:    new Date().toISOString(),
        consent,
      }

      // ── STEP 4: Confirmation email — NON-BLOCKING ─────────────────────────
      // A 500 from the Edge Function must NEVER block the ticket from showing.
      // Sends both: user confirmation + admin notification.
      try {
        const invokeResult = await supabase.functions.invoke('send-ticket-email', {
          body: {
            email:       ticketData.email,
            name:        ticketData.fullName,
            ticket_id:   ticketData.ticketNumber,
            phone:       phone.trim(),
            ticket_type: mode === 'virtual' ? 'Virtual' : 'In Person',
            event_date:  eventDate,
            event_venue: mode === 'virtual' ? eventVenueVirtual : eventVenuePhysical,
          },
        })
        console.log('Email invoke result:', invokeResult)
      } catch (emailErr) {
        console.warn('Email failed but ticket saved, ignoring:', emailErr)
      }

      // ── STEP 5: Show the ticket ───────────────────────────────────────────
      onTicketGenerated(ticketData)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('REAL REGISTER ERROR:', err)
      setSubmitErr('Something went wrong: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Shared style helpers ──────────────────────────────────────────────────
  const inputCls = (err: boolean) => [
    'w-full px-5 py-4 rounded-xl font-body text-sm text-white',
    'border transition-all duration-200 bg-white/5',
    'placeholder-white/35 focus:outline-none focus:ring-2',
    err
      ? 'border-red-400/70 focus:ring-red-400/20'
      : 'border-white/20 hover:border-white/35 focus:border-[#C8900A] focus:ring-[#C8900A]/20',
  ].join(' ')

  const lbl = 'block font-body font-bold text-xs tracking-[0.2em] uppercase mb-2'

  const ErrMsg = ({ msg }: { msg?: string }) =>
    msg ? (
      <motion.p initial={{opacity:0,y:-3}} animate={{opacity:1,y:0}} exit={{opacity:0}}
        className="mt-1.5 text-xs text-red-400" role="alert" aria-live="polite">
        {msg}
      </motion.p>
    ) : null

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section id="register" className="relative py-24 md:py-36 overflow-hidden bg-section-c grain">

      {/* ── File inputs sit OUTSIDE <form> ─────────────────────────────────
          This is the fix for "file picker close → form submit" on Android.
          The buttons inside the form trigger these refs via .click() only.  */}
      <input ref={galleryRef} type="file" accept="image/*"
        onChange={handleFile} className="sr-only"
        aria-label="Choose photo from gallery or files" />
      <input ref={cameraRef} id="camera-input" type="file" accept="image/*" capture="user"
        onChange={handleFile} className="sr-only"
        aria-label="Take photo with camera" />

      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{background:'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(13,47,163,0.35) 0%,transparent 60%)'}} />

      <Container>
        {/* Heading */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={VIEWPORT_ONCE} className="text-center mb-16">
          <p className="font-body font-bold uppercase mb-5"
            style={{fontSize:'0.7rem',letterSpacing:'0.3em',color:'#C9A86A'}}>
            Join the Movement
          </p>
          <h2 className="font-display font-bold text-white mb-4"
            style={{fontSize:'clamp(2rem,5vw,3.5rem)',lineHeight:'1.05'}}>
            Register for{' '}
            <span className="italic" style={{color:'#E8C36B'}}>Rebuild Hangout 2026</span>
          </h2>
          <p style={{color:'#E8E9FF',fontSize:'16px'}} className="font-body max-w-sm mx-auto">
            Fill in your details to generate your personal digital ticket.
          </p>
          <div className="gold-line w-14 mx-auto mt-6" aria-hidden="true" />
        </motion.div>

        {/* Form card */}
        <motion.div variants={scaleIn} initial="hidden" whileInView="visible"
          viewport={VIEWPORT_ONCE} className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden"
            style={{
              background:'rgba(13,47,163,0.28)',
              border:'1px solid rgba(200,144,10,0.2)',
              backdropFilter:'blur(24px)',
              boxShadow:'0 32px 80px rgba(7,26,94,0.5)',
            }}>
            <div className="h-px bg-gold-gradient" aria-hidden="true" />

            {/* Form — onSubmit prevented, no submit buttons inside */}
            <form onSubmit={e => e.preventDefault()} noValidate
              className="p-8 sm:p-10 space-y-7"
              aria-label="Rebuild Hangout 2026 registration">

              {/* Full Name */}
              <div>
                <label htmlFor="r-name" className={lbl} style={{color:'#C9A86A'}}>
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input id="r-name" type="text" autoComplete="name"
                  placeholder="Your full name" value={fullName}
                  onChange={e => setFullName(e.target.value)} onBlur={blurName}
                  aria-required="true" aria-invalid={!!(touched.name&&errs.fullName)}
                  className={inputCls(!!(touched.name&&errs.fullName))} />
                <AnimatePresence>{touched.name && <ErrMsg msg={errs.fullName} />}</AnimatePresence>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="r-email" className={lbl} style={{color:'#C9A86A'}}>
                  Email <span className="text-red-400">*</span>
                </label>
                <input id="r-email" type="email" autoComplete="email"
                  placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} onBlur={blurEmail}
                  aria-required="true" aria-invalid={!!(touched.email&&errs.email)}
                  className={inputCls(!!(touched.email&&errs.email))} />
                <AnimatePresence>{touched.email && <ErrMsg msg={errs.email} />}</AnimatePresence>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="r-phone" className={lbl} style={{color:'#C9A86A'}}>
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input id="r-phone" type="tel" autoComplete="tel"
                  placeholder="08012345678" value={phone}
                  onChange={e => setPhone(e.target.value)} onBlur={blurPhone}
                  aria-required="true" aria-invalid={!!(touched.phone&&errs.phone)}
                  className={inputCls(!!(touched.phone&&errs.phone))} />
                <AnimatePresence>{touched.phone && <ErrMsg msg={errs.phone} />}</AnimatePresence>
              </div>

              {/* ── Profile Photo ─────────────────────────────────────────── */}
              <div>
                <p className={lbl} style={{color:'#C9A86A'}}>
                  Profile Photo{' '}
                  <span className="font-normal normal-case tracking-normal text-[11px]" style={{color:'rgba(200,144,10,0.7)'}}>
                    (required — appears on your ticket)
                  </span>
                </p>

                {/* IDLE — upload buttons */}
                {cropStep === 'idle' && (
                  <div className="flex items-start gap-4">
                    {/* Dashed placeholder circle */}
                    <div className="w-[72px] h-[72px] rounded-full flex-shrink-0
                      flex flex-col items-center justify-center text-center"
                      style={{border:'2px dashed rgba(200,144,10,0.4)',background:'rgba(200,144,10,0.04)'}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(200,144,10,0.45)" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                      </svg>
                      <span className="text-[8px] text-white/30 mt-0.5 leading-tight px-1">No photo</span>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      {/* Gallery (no capture → shows Camera + Gallery + Files chooser) */}
                      <button type="button" onClick={() => galleryRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full
                          font-body font-bold text-sm"
                        style={{
                          background:'linear-gradient(135deg,#C8900A 0%,#E8C36B 50%,#D4A017 100%)',
                          color:'#071A5E',
                          boxShadow:'0 3px 12px rgba(200,144,10,0.3)',
                        }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                          strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        Choose from Gallery
                      </button>

                      {/* Camera — uses <label> so the native file picker fires as a
                          direct user gesture on iOS/Android, bypassing the .click() block */}
                      <label htmlFor="camera-input"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full
                          font-body font-bold text-sm cursor-pointer"
                        style={{
                          border:'1px solid rgba(200,144,10,0.5)',
                          color:'#C9A86A',
                          background:'transparent',
                        }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                          strokeLinejoin="round" aria-hidden="true">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        Take Photo
                      </label>

                      <p className="text-[11px] text-white/30">JPG, PNG or WebP · max 5 MB</p>
                    </div>
                  </div>
                )}

                {/* CROPPING ─────────────────────────────────────────────── */}
                {cropStep === 'cropping' && blobUrl && (
                  <div className="mt-2">
                    {/*
                      FIXED HEIGHT 400px — react-easy-crop requires a parent with
                      explicit non-zero dimensions. Using clamp/auto causes 0-height
                      on some mobile browsers, which breaks pixelCrop calculation.
                    */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '400px',           // ← FIXED, never 0
                      background: '#050505',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      touchAction: 'none',       // ← prevents page scroll during drag
                    }}>
                      <Cropper
                        image={blobUrl}
                        crop={cropPos}
                        zoom={zoom}
                        minZoom={1}
                        maxZoom={3}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        restrictPosition={true}
                        onCropChange={setCropPos}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        style={{
                          containerStyle: {
                            borderRadius: '16px',
                            // Explicit width+height on the inner container too
                            width: '100%',
                            height: '400px',
                          },
                          cropAreaStyle: {
                            border: '2.5px solid #FACC15',
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
                          },
                        }}
                      />
                    </div>

                    {/* Zoom slider */}
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-xs font-bold text-white/40 select-none w-6 text-right shrink-0">1×</span>
                      <div className="flex-1 flex flex-col gap-1">
                        <input
                          type="range" min={1} max={3} step={0.02}
                          value={zoom}
                          onChange={e => setZoom(Number(e.target.value))}
                          aria-label="Zoom 1x to 3x"
                          className="w-full cursor-pointer"
                          style={{accentColor:'#FACC15', height:'4px'}}
                        />
                        <div className="flex justify-between text-[10px] text-white/25 select-none">
                          <span>Zoom Out</span>
                          <span>Zoom In</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white/40 select-none w-6 shrink-0">3×</span>
                    </div>

                    <p className="text-[11px] text-white/35 mt-2 mb-4 text-center">
                      Drag your face into the circle · pinch or use slider to zoom (1× – 3×)
                    </p>

                    <div className="flex gap-3">
                      <button type="button" onClick={handleUseFace} disabled={cropBusy}
                        className="flex-1 py-3.5 rounded-full font-body font-bold text-sm
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background:'linear-gradient(135deg,#C8900A 0%,#E8C36B 50%,#D4A017 100%)',
                          color:'#071A5E',
                          boxShadow:'0 4px 16px rgba(200,144,10,0.35)',
                        }}>
                        {cropBusy ? 'Processing…' : '✓ Use This Photo'}
                      </button>
                      <button type="button" onClick={handleRemovePhoto}
                        className="px-6 py-3.5 rounded-full font-body text-sm
                          text-white/50 hover:text-white transition-colors"
                        style={{border:'1px solid rgba(255,255,255,0.15)'}}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* DONE — 72px circle preview */}
                {cropStep === 'done' && photoData && (
                  <div className="flex items-center gap-4 mt-1">
                    <div className="relative flex-shrink-0">
                      <img src={photoData} alt="Your photo"
                        className="w-[72px] h-[72px] rounded-full object-cover"
                        style={{border:'2.5px solid #FACC15',boxShadow:'0 0 14px rgba(250,204,21,0.3)'}}
                        onLoad={() => console.log('[preview] face circle rendered ✓')}
                      />
                      <button type="button" onClick={handleRemovePhoto}
                        aria-label="Remove photo"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full
                          flex items-center justify-center text-[11px] font-bold"
                        style={{background:'#ef4444',color:'#fff'}}>
                        ×
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Photo saved ✓</p>
                      <button type="button" onClick={handleRemovePhoto}
                        className="text-xs text-[#C9A86A] underline underline-offset-2
                          hover:text-white transition-colors mt-0.5">
                        Edit / Change
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {photoErr && (
                    <motion.p initial={{opacity:0,y:-3}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                      className="mt-2 text-xs text-red-400" role="alert">
                      {photoErr}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Attendance Mode ───────────────────────────────────────── */}
              <div>
                <p id="mode-label" className={lbl} style={{color:'#C9A86A'}}>
                  Attendance Mode <span className="text-red-400">*</span>
                </p>
                <div role="radiogroup" aria-labelledby="mode-label" className="grid grid-cols-2 gap-3">
                  {(['physical','virtual'] as AttendanceMode[]).map(m => {
                    const active = mode === m
                    return (
                      <button key={m} type="button" role="radio" aria-checked={active}
                        onClick={() => setMode(m)}
                        className="relative py-4 px-4 rounded-xl font-body transition-all
                          duration-200 cursor-pointer text-left focus-visible:outline-2
                          focus-visible:outline-[#FACC15]"
                        style={{
                          border: active ? '2px solid #FACC15' : '1px solid rgba(255,255,255,0.18)',
                          background: active ? 'rgba(250,204,21,0.14)' : 'rgba(255,255,255,0.04)',
                          boxShadow: active ? '0 0 0 4px rgba(250,204,21,0.07)' : 'none',
                        }}>
                        <AnimatePresence>
                          {active && (
                            <motion.span
                              initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
                              exit={{scale:0,opacity:0}}
                              transition={{type:'spring',stiffness:400,damping:20}}
                              className="absolute top-2.5 right-3 w-5 h-5 rounded-full
                                flex items-center justify-center text-[10px] font-bold"
                              style={{background:'#FACC15',color:'#071A5E'}}
                              aria-hidden="true">✓
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <span className="block font-bold text-[11px] uppercase tracking-widest mb-0.5"
                          style={{color: active ? '#FACC15' : '#C9A86A'}}>
                          {m === 'physical' ? 'In Person' : 'Online'}
                        </span>
                        <span className="block text-xs font-normal"
                          style={{color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}}>
                          {m === 'physical' ? 'Physical attendance' : 'Virtual / live stream'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Consent ───────────────────────────────────────────────── */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="sr-only" aria-label="Consent to receive event updates" />
                  <div className="w-4 h-4 rounded flex items-center justify-center transition-all"
                    style={{
                      border: consent ? '2px solid #FACC15' : '2px solid rgba(255,255,255,0.25)',
                      background: consent ? '#FACC15' : 'transparent',
                    }} aria-hidden="true">
                    {consent && (
                      <svg width="9" height="9" viewBox="0 0 12 10" fill="none"
                        stroke="#071A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1,5 4,8 11,1"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[12px] leading-relaxed" style={{color:'rgba(255,255,255,0.5)'}}>
                  I agree to receive event updates via email.{' '}
                  <span className="text-red-400">*</span>
                </span>
              </label>

              {/* Submit error */}
              <AnimatePresence>
                {submitErr && (
                  <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className="text-sm text-red-400 text-center" role="alert">
                    {submitErr}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* ── Generate button — type="button", never type="submit" ─── */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit}
                  className="w-full py-4 px-8 rounded-full font-body font-bold text-base
                    tracking-wide transition-all duration-300 flex items-center justify-center gap-3"
                  style={{
                    background: canSubmit
                      ? 'linear-gradient(135deg,#C8900A 0%,#E8C36B 45%,#D4A017 100%)'
                      : 'rgba(200,144,10,0.2)',
                    color: canSubmit ? '#071A5E' : 'rgba(255,255,255,0.3)',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit ? '0 4px 24px rgba(200,144,10,0.4)' : 'none',
                  }}>
                  {loading ? (
                    <>
                      <motion.svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24"
                        animate={{rotate:360}} transition={{repeat:Infinity,duration:0.8,ease:'linear'}}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </motion.svg>
                      Generating ticket…
                    </>
                  ) : canSubmit ? (
                    'Generate My Ticket →'
                  ) : (
                    'Complete required fields first'
                  )}
                </button>

                {!canSubmit && !loading && (
                  <p className="text-center text-[11px] mt-2"
                    style={{color:'rgba(255,255,255,0.28)'}}>
                    {[
                      !nameOk  && 'Full name',
                      !emailOk && 'Valid email',
                      !phoneOk && 'Valid phone',
                      !modeOk  && 'Attendance mode',
                      !consent && 'Consent',
                    ].filter(Boolean).join(' · ')} required
                    {!photoOk && <span className="block mt-0.5">Profile photo required</span>}
                  </p>
                )}
              </div>

            </form>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

export default RegistrationForm
