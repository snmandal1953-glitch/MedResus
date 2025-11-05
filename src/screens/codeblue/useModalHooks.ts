import { useState } from 'react';

export function useResuscitationEnd() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [cause, setCause] = useState('');
  const [notes, setNotes] = useState('');

  return {
    isModalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    reason,
    setReason,
    cause,
    setCause,
    notes,
    setNotes,
    reset: () => {
      setReason('');
      setCause('');
      setNotes('');
    }
  };
}

export function useRoscDetails() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [cause, setCause] = useState('');
  const [team, setTeam] = useState('');
  const [notes, setNotes] = useState('');

  return {
    isModalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    cause,
    setCause,
    team,
    setTeam,
    notes,
    setNotes,
    reset: () => {
      setCause('');
      setTeam('');
      setNotes('');
    }
  };
}

export function useReversibleCauseNote() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [cause, setCause] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [intervention, setIntervention] = useState('');

  return {
    isModalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    cause,
    setCause,
    discussion,
    setDiscussion,
    intervention,
    setIntervention,
    reset: () => {
      setCause('');
      setDiscussion('');
      setIntervention('');
    }
  };
}

export function useRhythmAnalysis() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [rhythm, setRhythm] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [plan, setPlan] = useState('');

  return {
    isModalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    rhythm,
    setRhythm,
    analysis,
    setAnalysis,
    plan,
    setPlan,
    reset: () => {
      setRhythm('');
      setAnalysis('');
      setPlan('');
    }
  };
}