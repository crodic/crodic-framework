"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Mail, MessageSquare } from "lucide-react";

export function FaqSection() {
  const t = useTranslations("Landing.faq") as any;

  const faqs = [
    {
      id: "item-1",
      question: t("q1.question"),
      answer: t("q1.answer"),
    },
    {
      id: "item-2",
      question: t("q2.question"),
      answer: t("q2.answer"),
    },
    {
      id: "item-3",
      question: t("q3.question"),
      answer: t("q3.answer"),
    },
    {
      id: "item-4",
      question: t("q4.question"),
      answer: t("q4.answer"),
    },
    {
      id: "item-5",
      question: t("q5.question"),
      answer: t("q5.answer"),
    },
    {
      id: "item-6",
      question: t("q6.question"),
      answer: t("q6.answer"),
    },
  ];

  return (
    <section id="faq" className="border-border/40 border-t py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase">
            <HelpCircle className="size-3.5" />
            {t("badge")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-3 text-base sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="border-border/70 bg-card mt-12 rounded-2xl border p-6 shadow-sm sm:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-foreground hover:text-primary text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Need more help banner */}
          <div className="border-border/60 bg-muted/40 mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:p-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <MessageSquare className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-foreground text-sm font-semibold">
                  {t("contactPrompt.title")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("contactPrompt.desc")}
                </p>
              </div>
            </div>

            <a
              href="mailto:alice01422@gmail.com"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors"
            >
              <Mail className="size-3.5" />
              <span>alice01422@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
