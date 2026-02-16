/**
 * Notification sound utility for Campus-Grab admin
 * Uses Web Audio API to generate a loud, attention-grabbing notification tone
 * No external audio files needed
 */

let audioContext: AudioContext | null = null
let isAudioUnlocked = false

/**
 * Initialize AudioContext - must be called from a user gesture (click/tap)
 * to satisfy browser autoplay policies
 */
export function unlockAudio(): void {
    if (isAudioUnlocked) return
    try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        // Play a silent sound to unlock
        const buffer = audioContext.createBuffer(1, 1, 22050)
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        source.connect(audioContext.destination)
        source.start(0)
        isAudioUnlocked = true
        console.log('[NotificationSound] Audio unlocked')
    } catch (e) {
        console.warn('[NotificationSound] Failed to unlock audio:', e)
    }
}

/**
 * Play a loud, multi-tone notification sound
 * Pattern: Three ascending beeps (like a cash register / order bell)
 */
export function playOrderNotification(): void {
    if (!audioContext || audioContext.state === 'closed') {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        } catch {
            console.warn('[NotificationSound] Cannot create AudioContext')
            return
        }
    }

    // Resume if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume()
    }

    const now = audioContext.currentTime

    // Play 3 ascending tones for urgency
    const tones = [
        { freq: 880, start: 0, duration: 0.15 },     // A5
        { freq: 1100, start: 0.2, duration: 0.15 },   // C#6
        { freq: 1320, start: 0.4, duration: 0.25 },   // E6
    ]

    // Repeat the pattern twice for extra loudness
    for (let repeat = 0; repeat < 2; repeat++) {
        const offset = repeat * 0.8

        tones.forEach(({ freq, start, duration }) => {
            const oscillator = audioContext!.createOscillator()
            const gainNode = audioContext!.createGain()

            oscillator.type = 'square' // Square wave is louder and more piercing
            oscillator.frequency.setValueAtTime(freq, now + offset + start)

            // Loud attack, quick decay
            gainNode.gain.setValueAtTime(0, now + offset + start)
            gainNode.gain.linearRampToValueAtTime(0.6, now + offset + start + 0.02)  // Fast attack
            gainNode.gain.linearRampToValueAtTime(0.4, now + offset + start + duration * 0.5)
            gainNode.gain.linearRampToValueAtTime(0, now + offset + start + duration) // Decay

            oscillator.connect(gainNode)
            gainNode.connect(audioContext!.destination)

            oscillator.start(now + offset + start)
            oscillator.stop(now + offset + start + duration)
        })
    }
}

/**
 * Check if audio is ready to play
 */
export function isAudioReady(): boolean {
    return isAudioUnlocked && audioContext !== null && audioContext.state !== 'closed'
}
