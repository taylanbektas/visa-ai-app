import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, BookOpen } from "lucide-react";

const articleContent: Record<string, { title: string; category: string; readTime: string; toc: string[]; content: string; related: string[] }> = {
  "schengen-guide": {
    title: "The Complete Schengen Visa Guide for Turkish Citizens",
    category: "Schengen",
    readTime: "12 min read",
    toc: ["What is the Schengen Area?", "The 26 Schengen Countries", "Visa Types", "Required Documents", "Financial Requirements", "Processing Time", "Appointment Booking", "Common Rejection Reasons"],
    content: `## What is the Schengen Area?

The Schengen Area is a zone comprising 26 European countries that have officially abolished all passport and border controls at their mutual borders. For Turkish citizens, this means that a single Schengen visa allows you to travel freely across all 26 member states for up to 90 days within any 180-day period.

The Schengen visa is one of the most sought-after visas globally, and understanding the application process thoroughly can significantly improve your chances of approval.

## The 26 Schengen Countries

The Schengen Area includes: Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovakia, Slovenia, Spain, Sweden, and Switzerland.

When applying, you should submit your application to the consulate of the country where you plan to spend the most time, or the country of first entry if you plan equal time across multiple destinations.

## Visa Types

The most common Schengen visa for Turkish citizens is the Type C (short-stay) visa. This covers tourist visits, business trips, family visits, and cultural events. It is valid for stays of up to 90 days within a 180-day period. Multiple-entry visas are also available for frequent travelers, typically granted after a history of successful single-entry applications.

## Required Documents

Your application must include: a completed application form, passport with at least two blank pages and validity extending 3 months beyond your planned stay, two recent biometric photographs (35x45mm), travel medical insurance with minimum €30,000 coverage, proof of accommodation (hotel bookings, invitation letter), flight itinerary (round-trip reservation), and proof of financial means.

## Financial Requirements

For Turkish citizens, consulates typically require bank statements from the last 3-6 months showing a minimum balance. As a general guideline, you should demonstrate approximately €50-100 per day of your planned stay. A steady income flow is more important than a large lump sum deposited recently — consulates look for consistent financial stability.

Your bank statements should show regular salary deposits if employed, or business income if self-employed. Avoid making large cash deposits just before your application as this raises red flags.

## Processing Time

Standard processing takes 10-15 business days from the date of your appointment. During peak travel season (May-August), processing may take longer. It's recommended to apply at least 6 weeks before your planned travel date, and no earlier than 6 months in advance.

## Appointment Booking

Most Schengen consulates in Turkey use VFS Global or iDATA as their appointment service providers. Appointments can be booked online through these platforms. During peak season, appointment slots fill up quickly — we recommend booking as soon as you have your documents ready.

## Common Rejection Reasons

The most frequent reasons for Schengen visa rejection for Turkish applicants include: insufficient proof of financial means, unclear purpose of travel, lack of strong ties to Turkey (employment, property, family), incomplete documentation, previous visa violations, and inadequate travel insurance coverage. Working with a professional visa consultancy like VisaPath can help you avoid these common pitfalls.`,
    related: ["rejection-reasons", "biometric-photo", "cover-letter"],
  },
  "us-tourist-visa": {
    title: "How to Apply for a US Tourist Visa (B-1/B-2) — Step by Step",
    category: "USA",
    readTime: "15 min read",
    toc: ["Overview", "DS-160 Form", "MRV Fee Payment", "Interview Preparation", "Required Documents", "Common Interview Questions", "Refusal Under INA 214(b)"],
    content: `## Overview

The B-1/B-2 visa is the most common nonimmigrant visa for temporary visitors to the United States. The B-1 category covers business visitors, while B-2 covers tourists, medical treatment seekers, and those visiting family or friends. For most Turkish applicants, the B-2 tourist visa is the relevant category.

The US visa process is unique because it requires an in-person interview at the US Embassy or Consulate. The interview is a critical component — even with perfect documentation, a poor interview performance can result in a visa denial.

## DS-160 Form

The DS-160 is the online nonimmigrant visa application form. You must complete this before scheduling your interview. The form takes approximately 60-90 minutes to complete and covers your personal information, travel plans, work history, education, and security-related questions.

Key tips for the DS-160: answer every question honestly and consistently, upload a photo that meets strict US requirements (2x2 inches, white background, taken within 6 months), and save your confirmation page — you'll need the barcode number for your interview.

## MRV Fee Payment

The Machine Readable Visa (MRV) fee for a B-1/B-2 visa is currently $185. This fee is non-refundable regardless of whether your visa is approved or denied. Payment can be made at designated bank branches in Turkey or online through the US visa appointment scheduling system.

## Interview Preparation

The consular interview typically lasts 2-5 minutes. The officer's primary concern is whether you have strong ties to Turkey that will compel you to return after your visit. Prepare to clearly articulate: the purpose of your trip, your travel dates, where you will stay, who is funding the trip, your employment situation, and your ties to Turkey.

Dress professionally, arrive early, bring organized documents, and answer questions directly and concisely. Do not volunteer unnecessary information or bring memorized speeches.

## Required Documents

While the consular officer may not ask to see all documents, you should bring: DS-160 confirmation page, passport, interview appointment letter, MRV fee receipt, recent photograph, proof of financial means (bank statements, tax returns), employment verification letter, property ownership documents, family ties documentation, and your travel itinerary.

## Common Interview Questions

Expect questions like: "What is the purpose of your visit?", "How long do you plan to stay?", "Who will you be visiting?", "What do you do for work?", "Have you traveled internationally before?", "Who is paying for the trip?", and "Do you have family in the US?"

## Refusal Under INA 214(b)

Section 214(b) of the Immigration and Nationality Act presumes that every B visa applicant is an intending immigrant until they prove otherwise. This is the most common reason for visa denial. If refused, you will receive a letter explaining the refusal. You can reapply at any time, but you should address the reasons for refusal — typically by providing stronger evidence of ties to your home country.

Working with VisaPath's Concierge plan gives you access to interview coaching that significantly improves approval rates for US visa applications.`,
    related: ["schengen-guide", "rejection-reasons", "cover-letter"],
  },
  "uk-visitor-visa": {
    title: "UK Standard Visitor Visa: Everything You Need to Know",
    category: "UK",
    readTime: "10 min read",
    toc: ["Overview", "Online Application", "Biometric Enrollment", "Required Documents", "Financial Requirements", "Processing Time"],
    content: `## Overview

The UK Standard Visitor Visa allows you to visit the United Kingdom for tourism, business meetings, medical treatment, or academic activities for up to 6 months. Turkish citizens require this visa before traveling to the UK. Unlike Schengen, the UK has its own separate visa system managed by UK Visas and Immigration (UKVI).

## Online Application

The application process begins online at the official UKVI portal. You'll need to create an account, complete the application form, and pay the visa fee (currently £115 for a standard 6-month visa). The online form covers your personal details, travel history, financial situation, and purpose of visit.

After completing the online form, you'll book a biometric appointment at a Visa Application Centre (VAC) in Turkey. VFS Global operates the VACs in Istanbul, Ankara, Izmir, and other major cities.

## Biometric Enrollment

At your VAC appointment, you'll submit your biometric data (fingerprints and a digital photograph). You'll also submit your passport and supporting documents. The appointment typically takes 15-30 minutes.

## Required Documents

Key documents include: a valid passport, proof of financial means (bank statements for the last 6 months), employment or business documents, accommodation details, flight reservations, and a cover letter explaining your visit. If visiting family or friends, include an invitation letter with their immigration status details.

## Financial Requirements

The UK does not specify a minimum bank balance, but you must demonstrate that you can comfortably fund your stay without working. Consular officers look for consistent income, savings that align with your stated plans, and evidence that you can maintain your lifestyle at home while funding travel.

## Processing Time

Standard processing takes 3-6 weeks. Priority services are available for an additional fee: Priority (5 working days) for £250 and Super Priority (next working day) for £500. We recommend applying at least 8 weeks before your planned travel.`,
    related: ["schengen-guide", "rejection-reasons", "biometric-photo"],
  },
  "rejection-reasons": {
    title: "Why Visa Applications Get Rejected (And How to Avoid It)",
    category: "Travel Tips",
    readTime: "8 min read",
    toc: ["Introduction", "Reason 1: Insufficient Financial Proof", "Reason 2: Weak Ties to Home Country", "Reason 3: Incomplete Documentation", "Reason 4: Inconsistent Information", "Reason 5: Previous Violations", "Reason 6: Inadequate Insurance", "Reason 7: Poor Interview Performance"],
    content: `## Introduction

Visa rejections are more common than most applicants realize. Understanding the top reasons applications are denied — and knowing how to address each one — can dramatically improve your chances of success. Here are the seven most common rejection reasons and practical fixes for each.

## Reason 1: Insufficient Financial Proof

This is the number one reason for visa rejection worldwide. Consulates want to see that you can comfortably afford your trip without financial strain. The fix: provide 3-6 months of bank statements showing regular income, maintain a balance that covers at least €50-100 per day of travel for Schengen, and avoid making large unexplained deposits before applying.

## Reason 2: Weak Ties to Home Country

Immigration officers need to believe you'll return home after your visit. The fix: provide employment contracts or business ownership documents, property deeds or long-term lease agreements, family documentation (marriage certificate, children's school enrollment), and any other evidence of ongoing commitments in your home country.

## Reason 3: Incomplete Documentation

Missing even one required document can result in rejection. The fix: use a detailed document checklist (like the one VisaPath provides), ensure all documents are properly translated if required, make copies of everything, and organize documents in the order the consulate expects.

## Reason 4: Inconsistent Information

Discrepancies between your application form and supporting documents raise red flags. The fix: cross-check all dates, amounts, and details across every document. Ensure your stated purpose of travel matches your itinerary, accommodation, and financial arrangements.

## Reason 5: Previous Immigration Violations

Overstaying a previous visa or violating visa conditions is taken very seriously. The fix: if you have past violations, address them honestly in your application. Provide evidence of changed circumstances and demonstrate that you now have stronger ties to your home country.

## Reason 6: Inadequate Travel Insurance

Many countries require specific minimum coverage. For Schengen visas, insurance must cover at least €30,000 in medical expenses and repatriation. The fix: purchase comprehensive travel insurance from a recognized provider that meets the specific requirements of your destination country.

## Reason 7: Poor Interview Performance

For countries requiring interviews (like the US), your performance matters as much as your documents. The fix: practice your answers, be concise and confident, dress professionally, and never lie or exaggerate. If you're nervous, consider professional interview preparation services like those offered in VisaPath's Concierge plan.`,
    related: ["schengen-guide", "us-tourist-visa", "cover-letter"],
  },
  "biometric-photo": {
    title: "Biometric Photo Requirements — The Complete Checklist",
    category: "Document Guides",
    readTime: "6 min read",
    toc: ["ICAO Standards", "Background Requirements", "Expression and Pose", "Size Specifications by Country", "Common Mistakes"],
    content: `## ICAO Standards

The International Civil Aviation Organization (ICAO) sets global standards for biometric photographs used in travel documents. Most countries follow these standards, with some additional country-specific requirements. Understanding these standards ensures your photo won't be rejected.

Key ICAO requirements: the photo must be in color, taken against a plain light-colored background, with your face clearly visible from forehead to chin and both ears showing. The photo must be recent (taken within the last 6 months) and accurately represent your current appearance.

## Background Requirements

The background must be plain white or off-white for most countries. The US requires a plain white background specifically. Schengen countries accept light gray or light blue. The UK requires a plain cream or light gray background. Avoid patterned backgrounds, shadows on the background, or backgrounds that blend with your hair or clothing.

## Expression and Pose

Your expression must be neutral with your mouth closed. No smiling, frowning, or raised eyebrows. Look directly at the camera with both eyes open and clearly visible. Your head should be centered and not tilted. Remove glasses unless medically required (some countries no longer accept photos with glasses at all). Head coverings are only acceptable for religious purposes, and your face must still be fully visible.

## Size Specifications by Country

**Schengen / EU**: 35mm × 45mm. Face should occupy 70-80% of the frame. Head height 32-36mm from chin to crown.

**United States**: 2 inches × 2 inches (51mm × 51mm). Head height must be between 1 inch and 1-3/8 inches (25-35mm) from chin to top of head.

**United Kingdom**: 45mm × 35mm. Head height 29-34mm from chin to crown.

**Canada**: 50mm × 70mm. Face height 31-36mm from chin to crown.

**Australia**: 35mm × 45mm. Head height 32-36mm from chin to crown.

## Common Mistakes

The most frequent photo rejection reasons include: incorrect dimensions, red-eye, shadows on face or background, photo too dark or overexposed, wearing glasses (increasingly rejected), head covering obscuring face, wrong background color, photo older than 6 months, and digital alterations or filters. Always use a professional photo service that understands visa requirements for your specific destination.`,
    related: ["schengen-guide", "uk-visitor-visa", "cover-letter"],
  },
  "cover-letter": {
    title: "How to Write a Visa Cover Letter That Gets Approved",
    category: "Document Guides",
    readTime: "7 min read",
    toc: ["Why a Cover Letter Matters", "Structure", "Tone and Language", "What to Include", "What to Avoid", "Sample Cover Letter"],
    content: `## Why a Cover Letter Matters

A visa cover letter is your opportunity to present your case directly to the consular officer. While not always mandatory, a well-written cover letter can significantly strengthen your application by clearly explaining your travel purpose, demonstrating your ties to your home country, and addressing any potential concerns proactively.

Think of it as a personal introduction that ties all your supporting documents together into a coherent narrative.

## Structure

Your cover letter should follow a clear, professional structure: start with your personal details and the visa you're applying for, then state your purpose of travel, provide details about your itinerary, explain your financial situation, highlight your ties to your home country, and close with a polite request for visa approval.

Keep it to one page — consular officers review hundreds of applications and appreciate conciseness.

## Tone and Language

Write in a professional but natural tone. Avoid being overly formal or using flowery language. Be direct, honest, and specific. Use proper grammar and spelling. If English isn't your first language, have it proofread by someone proficient in English.

## What to Include

Essential elements: your full name and passport number, the specific visa type and duration you're applying for, your detailed travel itinerary with dates, who you're visiting or where you're staying, how you're funding the trip, your employment situation, family ties in your home country, and your commitment to returning before the visa expires.

## What to Avoid

Never include false information, exaggerated claims about your wealth, emotional pleas, irrelevant personal stories, or criticism of your home country. Don't mention any intention to work, study, or extend your stay beyond what the visa permits. Avoid generic templates that don't reflect your actual situation.

## Sample Cover Letter

Dear Visa Officer,

I am writing to support my application for a Schengen Tourist Visa (Type C) to visit France from [dates]. My passport number is [number].

I am employed as [position] at [company] in Istanbul, Turkey, where I have worked for [X] years. I earn a monthly salary of [amount], as documented in my attached bank statements and employment letter.

The purpose of my visit is tourism. I plan to visit Paris, Lyon, and Nice over [X] days. I have booked accommodation at [hotel names] and have a round-trip flight reservation with [airline].

I have strong ties to Turkey: I own [property], my family resides here, and I am committed to returning to my position at [company]. I have previously visited [countries] and have always complied with visa regulations.

I kindly request you to consider my application favorably. All supporting documents are enclosed.

Sincerely,
[Your Name]`,
    related: ["schengen-guide", "rejection-reasons", "biometric-photo"],
  },
};

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const article = id ? articleContent[id] : null;

  if (!article) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <Link to="/learn"><Button variant="outline">Back to Knowledge Base</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft size={14} /> Back to Knowledge Base
          </Link>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar TOC */}
            <aside className="hidden md:block">
              <div className="sticky top-24">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contents</h4>
                <nav className="space-y-2">
                  {article.toc.map((item) => (
                    <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <motion.article
              className="md:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-2 py-0.5 bg-muted rounded-full font-medium text-muted-foreground">{article.category}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {article.readTime}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">{article.title}</h1>

              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4">
                {article.content.split("\n\n").map((para, i) => {
                  if (para.startsWith("## ")) {
                    const heading = para.replace("## ", "");
                    return <h2 key={i} id={heading.toLowerCase().replace(/\s+/g, "-")} className="text-lg font-bold text-foreground mt-8 mb-3">{heading}</h2>;
                  }
                  if (para.startsWith("**")) {
                    return <p key={i} className="font-medium text-foreground">{para.replace(/\*\*/g, "")}</p>;
                  }
                  return <p key={i}>{para}</p>;
                })}
              </div>

              {/* CTA */}
              <div className="mt-12 p-6 rounded-xl bg-gradient-navy text-primary-foreground">
                <h3 className="font-bold mb-2">Ready to apply? Let us handle the paperwork.</h3>
                <p className="text-sm opacity-70 mb-4">VisaPath experts will guide you through every step of your visa application.</p>
                <Link to="/apply">
                  <Button className="bg-accent text-accent-foreground hover:bg-gold-dark">
                    Start Your Application <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Related */}
              {article.related.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-bold mb-4">Related Articles</h3>
                  <div className="grid gap-3">
                    {article.related.map((relId) => {
                      const rel = articleContent[relId];
                      if (!rel) return null;
                      return (
                        <Link key={relId} to={`/learn/${relId}`} className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors">
                          <BookOpen size={16} className="text-accent shrink-0" />
                          <span className="text-sm font-medium">{rel.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.article>
          </div>
        </div>
      </div>
    </div>
  );
}
