"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ANSWERS_KEY, EMPTY_ANSWERS, STARTER_ANSWERS, normalizeAnswers } from "@/lib/answers";
import { useStored } from "@/lib/storage";
import type { Answers } from "@/lib/types";
import { buttonClass } from "./controls";

export function StartActions() {
  const router = useRouter();
  const [answers, setAnswers] = useStored<Answers>(ANSWERS_KEY, EMPTY_ANSWERS, normalizeAnswers);
  const started = answers && answers.build !== null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
      {started ? (
        <>
          <Link href="/list" className={buttonClass.primary}>
            Open my list
          </Link>
          <Link href="/build" className={buttonClass.secondary}>
            Change my answers
          </Link>
          <Link
            href="/list#first-hour"
            className="inline-flex min-h-11 basis-full items-center text-[0.95rem] font-semibold text-ink underline underline-offset-2"
          >
            Happening now? See what to do first
          </Link>
        </>
      ) : (
        <>
          <Link href="/build" className={buttonClass.primary}>
            Start
          </Link>
          <button
            type="button"
            className="text-ink-soft underline underline-offset-2 hover:text-ink"
            onClick={() => {
              setAnswers(STARTER_ANSWERS);
              router.push("/list");
            }}
          >
            Skip the questions and show a starter list
          </button>
        </>
      )}
    </div>
  );
}
