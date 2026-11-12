"use client";

import { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { formatCoins, formatCountdown } from "@/lib/format";
import { QUIZ_COMPLETION_REWARD, QUIZ_CORRECT_REWARD } from "@/lib/game-config";
import { msUntilNextDay, questionsForDay, utcDayKey } from "@/lib/quiz-data";
import { AiPanel } from "./ai-panel";
import { useGame } from "./game-provider";

interface Review {
  index: number;
  selected: number;
}

export function QuizScreen() {
  const { state, answerQuiz } = useGame();
  const now = useNow(1000);
  const [review, setReview] = useState<Review | null>(null);

  const today = utcDayKey(now);
  const questions = questionsForDay(today);
  const sameDay = state.quiz.day === today;
  const answers = sameDay ? state.quiz.answers : [];
  const done = sameDay && state.quiz.done;
  const correctCount = answers.filter((a, i) => questions[i] && a === questions[i].answerIndex).length;

  const reviewQuestion = review ? questions[review.index] : null;

  if (reviewQuestion && review) {
    const right = review.selected === reviewQuestion.answerIndex;
    const lastQuestion = review.index === questions.length - 1;
    return (
      <div className="flex flex-col gap-4">
        <div
          className={`flex items-center gap-3 rounded-2xl border p-4 ${
            right ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"
          }`}
        >
          {right ? (
            <CheckCircle2 className="size-8 text-primary" aria-hidden="true" />
          ) : (
            <XCircle className="size-8 text-destructive" aria-hidden="true" />
          )}
          <div>
            <p className="text-lg font-black text-foreground">{right ? "Correct" : "Not quite"}</p>
            <p className="text-sm text-muted-foreground">
              {right ? `+${QUIZ_CORRECT_REWARD} coins` : `Answer: ${reviewQuestion.options[reviewQuestion.answerIndex]}`}
            </p>
          </div>
        </div>

        <p className="text-base font-semibold text-foreground">{reviewQuestion.question}</p>

        <AiPanel
          title="AI answer explanation"
          requestKey={`quiz-${reviewQuestion.id}-${review.selected}`}
          body={{ mode: "quiz", questionId: reviewQuestion.id, selectedIndex: review.selected }}
          autoRun
        />

        <Button size="lg" onClick={() => setReview(null)} className="font-bold">
          {lastQuestion ? "See results" : "Next question"}
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <header>
          <h2 className="text-2xl font-black text-foreground">Daily Crypto Quiz</h2>
          <p className="text-sm text-muted-foreground">Today&apos;s challenge is complete.</p>
        </header>
        <section className="flex flex-col items-center gap-2 rounded-2xl border border-primary/60 bg-card p-6 text-center glow-gold">
          <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
          <p className="text-4xl font-black tabular-nums text-primary">
            {correctCount}/{questions.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Earned {formatCoins(correctCount * QUIZ_CORRECT_REWARD + QUIZ_COMPLETION_REWARD)} coins
            including the completion bonus
          </p>
        </section>
        <section className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Clock className="size-6 text-accent" aria-hidden="true" />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Next quiz opens in</p>
            <p className="text-xl font-black tabular-nums text-foreground">
              {formatCountdown(msUntilNextDay(now))}
            </p>
          </div>
        </section>
      </div>
    );
  }

  const index = answers.length;
  const question = questions[index];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">Daily Crypto Quiz</h2>
          <p className="text-sm text-muted-foreground">
            +{QUIZ_CORRECT_REWARD} per correct answer, +{formatCoins(QUIZ_COMPLETION_REWARD)} for finishing
          </p>
        </div>
        <p className="text-xl font-black tabular-nums text-primary">
          {index + 1}/{questions.length}
        </p>
      </header>

      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index}
        aria-label="Quiz progress"
      >
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={`h-1.5 flex-1 rounded-full ${i < index ? "bg-primary" : i === index ? "bg-accent" : "bg-muted"}`}
          />
        ))}
      </div>

      <h3 className="text-lg font-bold leading-snug text-foreground text-balance">{question.question}</h3>

      <ul className="flex flex-col gap-2.5">
        {question.options.map((option, optionIndex) => (
          <li key={option}>
            <button
              type="button"
              onClick={() => {
                answerQuiz(optionIndex);
                setReview({ index, selected: optionIndex });
              }}
              className="tap-target w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-base font-medium text-foreground transition-colors hover:border-accent hover:bg-accent/10 focus-visible:border-accent focus-visible:outline-none"
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
