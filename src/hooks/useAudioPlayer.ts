import { useRef, useEffect, useState, useCallback } from 'react';
import { BGM_PLAYLIST, DEFAULT_VOLUME } from '../constants/gameConfig';

export function useAudioPlayer() {
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [bgmVolume, setBgmVolume] = useState(DEFAULT_VOLUME.BGM);

    const bgmRef = useRef<HTMLAudioElement | null>(null);

    // Auto-play and unlock strategy
    useEffect(() => {
        const attemptPlay = async () => {
            if (bgmRef.current) {
                bgmRef.current.volume = bgmVolume;
                try {
                    await bgmRef.current.play();
                    setIsPlaying(true);
                    setAudioUnlocked(true);
                } catch (e) {
                    console.log("Auto-play blocked.");
                }
            }
        };

        attemptPlay();

        const unlockAudio = () => {
            if (audioUnlocked) return;
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            ctx.resume();
            if (bgmRef.current && !isPlaying && !isMuted) {
                bgmRef.current.volume = bgmVolume;
                bgmRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(e => console.error(e));
            }
            setAudioUnlocked(true);
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };

        window.addEventListener('click', unlockAudio);
        window.addEventListener('keydown', unlockAudio);

        return () => {
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    // Audio controls
    useEffect(() => {
        if (!bgmRef.current) return;
        if (isPlaying && !isMuted) {
            bgmRef.current.play().catch(() => { });
        } else {
            bgmRef.current.pause();
        }
    }, [isPlaying, isMuted, currentTrackIndex]);

    useEffect(() => {
        if (bgmRef.current) {
            bgmRef.current.volume = bgmVolume;
        }
    }, [bgmVolume]);

    const toggleMute = useCallback(() => setIsMuted(!isMuted), [isMuted]);

    const handleNextTrack = useCallback(() => {
        let next = currentTrackIndex + 1;
        if (next >= BGM_PLAYLIST.length) next = 0;
        setCurrentTrackIndex(next);
        if (!isMuted) setIsPlaying(true);
    }, [currentTrackIndex, isMuted]);

    const togglePlayMusic = useCallback(() => setIsPlaying(!isPlaying), [isPlaying]);

    return {
        bgmRef,
        isMuted,
        isPlaying,
        currentTrackIndex,
        audioUnlocked,
        bgmVolume,
        setBgmVolume,
        toggleMute,
        handleNextTrack,
        togglePlayMusic,
    };
}
