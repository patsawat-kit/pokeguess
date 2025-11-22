import { useRef, useCallback, useState } from 'react';
import { DEFAULT_VOLUME } from '../constants/gameConfig';

export function useSoundEffects(isMuted: boolean) {
    const [cryVolume, setCryVolume] = useState(DEFAULT_VOLUME.CRY);
    const [sfxVolume, setSfxVolume] = useState(DEFAULT_VOLUME.SFX);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize audio context once
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                audioContextRef.current = new AudioContext();
            }
        }
        return audioContextRef.current;
    }, []);

    const playCry = useCallback((url: string) => {
        if (isMuted || !url) return;
        const audio = new Audio(url);
        audio.volume = cryVolume;
        audio.play().catch(() => { });
    }, [isMuted, cryVolume]);

    const playSound = useCallback((type: "beep" | "success" | "error") => {
        if (isMuted) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;

            if (type === "beep") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                gain.gain.setValueAtTime(sfxVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === "success") {
                osc.type = "square";
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.linearRampToValueAtTime(1800, now + 0.1);
                gain.gain.setValueAtTime(sfxVolume, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
            } else if (type === "error") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(sfxVolume, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            }
            osc.connect(gain);
            gain.connect(ctx.destination);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }, [isMuted, sfxVolume, getAudioContext]);

    return {
        cryVolume,
        setCryVolume,
        sfxVolume,
        setSfxVolume,
        playCry,
        playSound,
    };
}
