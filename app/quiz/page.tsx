'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, HelpCircle, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { QuizQuestion, QuizAnswer, User } from '@/lib/types'

export default function QuizPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [myAnswers, setMyAnswers] = useState<QuizAnswer[]>([])
  const [submitting, setSubmitting] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('klok_user')
    if (!stored) { router.push('/'); return }
    setCurrentUser(JSON.parse(stored))
  }, [router])

  const fetchData = useCallback(async () => {
    if (!currentUser) return
    const today = new Date().toISOString().split('T')[0]
    const [qRes, aRes] = await Promise.all([
      supabase
        .from('quiz_questions')
        .select('*')
        .lte('question_date', today)
        .order('question_date', { ascending: false }),
      supabase
        .from('quiz_answers')
        .select('*')
        .eq('user_id', currentUser.id),
    ])
    if (qRes.data) setQuestions(qRes.data)
    if (aRes.data) setMyAnswers(aRes.data)
  }, [currentUser])

  useEffect(() => { fetchData() }, [fetchData])

  const getMyAnswer = (questionId: number) => myAnswers.find(a => a.question_id === questionId)

  const submitAnswer = async (question: QuizQuestion, option: 'A' | 'B' | 'C') => {
    if (!currentUser || submitting !== null) return
    if (getMyAnswer(question.id)) return // already answered
    setSubmitting(question.id)

    const isCorrect = question.correct_option === option
    const pts = isCorrect ? 1 : 0

    await supabase.from('quiz_answers').insert({
      user_id: currentUser.id,
      question_id: question.id,
      chosen_option: option,
      points_awarded: pts,
    })

    if (pts > 0) {
      const { data: fresh } = await supabase.from('users').select('*').eq('id', currentUser.id).single()
      if (fresh) {
        await supabase.from('users').update({ total_points: fresh.total_points + 1 }).eq('id', currentUser.id)
        await supabase.from('point_events').insert({
          user_id: currentUser.id, points: 1,
          reason: `🧠 Quiz goed: ${question.match_reference}`,
        })
        localStorage.setItem('klok_user', JSON.stringify({ ...fresh, total_points: fresh.total_points + 1 }))
      }
    }

    await fetchData()
    setSubmitting(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0]
  }

  if (!currentUser) return null

  const today = questions.find(q => isToday(q.question_date))
  const past = questions.filter(q => !isToday(q.question_date))
  const totalQuizPts = myAnswers.reduce((s, a) => s + a.points_awarded, 0)

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: '#0a0a1a' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#1a0a2e', borderBottom: '2px solid #D4AF37' }}>
        <button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5 text-yellow-400" />
        </button>
        <div className="flex-1">
          <div className="text-yellow-400 font-black text-base" style={{ fontFamily: 'Arial Black, Arial' }}>
            🧠 DAGELIJKSE QUIZ
          </div>
          <div className="text-purple-400 text-xs">over het land van die dag — in Klokhuis-stijl 🕰️🍺</div>
        </div>
        {totalQuizPts > 0 && (
          <div className="text-right">
            <div className="text-yellow-400 font-black text-lg">{totalQuizPts}p</div>
            <div className="text-purple-500 text-xs">quiz punten</div>
          </div>
        )}
      </div>

      <div className="px-4 pt-5 space-y-4">

        {/* Uitleg banner */}
        <div className="rounded-xl px-4 py-3 text-center"
          style={{ backgroundColor: '#1a0a2e', border: '1px solid #4c1d95' }}>
          <p className="text-purple-300 text-xs leading-relaxed">
            Elke speeldag een vraag over het land dat die dag speelt —{' '}
            <span className="text-yellow-400 font-bold">bier, klokken, tijdzones en ludieke weetjes.</span>{' '}
            Geen voetbalkennis nodig. Goed = <span className="text-yellow-400 font-bold">+1p</span>.
          </p>
        </div>

        {/* Today's question — big and prominent */}
        {today ? (
          <div>
            <div className="text-yellow-400 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> Vraag van vandaag
            </div>
            <QuizCard
              question={today}
              myAnswer={getMyAnswer(today.id)}
              onAnswer={(opt) => submitAnswer(today, opt)}
              submitting={submitting === today.id}
              highlight
            />
          </div>
        ) : (
          <div className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: '#1a0a2e', border: '1px solid #3d1f6e' }}>
            <div className="text-4xl mb-2">⏳</div>
            <div className="text-purple-300 text-sm">Geen vraag vandaag.</div>
            <div className="text-purple-600 text-xs mt-1">Kom terug op een speeldag!</div>
          </div>
        )}

        {/* Past questions */}
        {past.length > 0 && (
          <div>
            <h2 className="text-yellow-400 font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" /> Eerdere vragen
            </h2>
            <div className="space-y-3">
              {past.map(q => (
                <QuizCard
                  key={q.id}
                  question={q}
                  myAnswer={getMyAnswer(q.id)}
                  onAnswer={(opt) => submitAnswer(q, opt)}
                  submitting={submitting === q.id}
                  highlight={false}
                />
              ))}
            </div>
          </div>
        )}

        {questions.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🧠</div>
            <div className="text-purple-600 text-sm">Quiz begint op 11 juni 2026</div>
            <div className="text-purple-800 text-xs mt-1">Elke speeldag een nieuwe vraag</div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuizCard({
  question, myAnswer, onAnswer, submitting, highlight,
}: {
  question: QuizQuestion
  myAnswer: QuizAnswer | undefined
  onAnswer: (opt: 'A' | 'B' | 'C') => void
  submitting: boolean
  highlight: boolean
}) {
  const answered = !!myAnswer
  const revealed = !!question.correct_option

  const getOptionStyle = (opt: 'A' | 'B' | 'C') => {
    if (!answered) {
      return {
        bg: highlight ? '#2d1a4d' : '#1a1a2e',
        border: highlight ? '#7c3aed' : '#2d2d5e',
        color: 'white',
      }
    }
    const isChosen = myAnswer?.chosen_option === opt
    const isCorrect = revealed && question.correct_option === opt
    const isWrong = isChosen && revealed && question.correct_option !== opt

    if (isCorrect) return { bg: '#064e3b', border: '#10b981', color: '#6ee7b7' }
    if (isWrong) return { bg: '#4c0519', border: '#f43f5e', color: '#fda4af' }
    if (isChosen && !revealed) return { bg: '#312e81', border: '#818cf8', color: '#c7d2fe' }
    return { bg: '#0f172a', border: '#1e293b', color: '#475569' }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('nl-NL', {
      weekday: 'short', day: 'numeric', month: 'short',
    })

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: highlight ? '#1a0a2e' : '#0f0f1f',
        border: `2px solid ${highlight ? '#7c3aed' : '#1e1e3f'}`,
      }}>
      {highlight && (
        <div className="px-3 py-1.5 text-xs font-black text-center animate-pulse"
          style={{ backgroundColor: '#7c3aed', color: 'white' }}>
          🧠 VRAAG VAN VANDAAG
        </div>
      )}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-purple-500 text-xs">{formatDate(question.question_date)}</span>
          <span className="text-purple-600 text-xs">{question.match_reference}</span>
        </div>

        <p className="text-white font-bold text-base mb-4 leading-snug">{question.question}</p>

        <div className="space-y-2">
          {(['A', 'B', 'C'] as const).map(opt => {
            const style = getOptionStyle(opt)
            const label = opt === 'A' ? question.option_a : opt === 'B' ? question.option_b : question.option_c
            const isChosen = myAnswer?.chosen_option === opt
            const isCorrect = revealed && question.correct_option === opt

            return (
              <button
                key={opt}
                onClick={() => !answered && !submitting && onAnswer(opt)}
                disabled={answered || submitting}
                className="w-full text-left rounded-xl px-4 py-3 transition-all active:scale-98 disabled:cursor-default flex items-center gap-3"
                style={{ backgroundColor: style.bg, border: `2px solid ${style.border}`, color: style.color }}
              >
                <span className="font-black text-lg w-6 flex-shrink-0"
                  style={{ color: isCorrect ? '#10b981' : isChosen && !isCorrect && revealed ? '#f43f5e' : style.color }}>
                  {isCorrect ? '✓' : isChosen && !isCorrect && revealed ? '✗' : opt}
                </span>
                <span className="text-sm font-medium">{label}</span>
                {isChosen && !revealed && (
                  <span className="ml-auto text-xs text-indigo-400">⏳ wacht op antwoord</span>
                )}
              </button>
            )
          })}
        </div>

        {answered && revealed && (
          <div className="mt-3 text-center">
            {myAnswer!.points_awarded > 0 ? (
              <div className="text-green-400 font-black text-sm">🎉 Goed! +1 punt verdiend!</div>
            ) : (
              <div className="text-red-400 text-sm">
                Helaas! Juiste antwoord: <strong>{question.correct_option}</strong>
              </div>
            )}
          </div>
        )}

        {answered && !revealed && (
          <div className="mt-3 text-center text-purple-500 text-xs">
            Antwoord wordt later bekendgemaakt
          </div>
        )}
      </div>
    </div>
  )
}
