'use client'
import { Lightbulb, Pencil, PencilRuler } from 'lucide-react'
import { motion } from 'motion/react'
export default function Content() {
    return (
        <section className="bg-background @container py-24">
            <div className="mx-auto max-w-2xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                >
                    <h2 className="text-balance font-serif text-4xl font-medium">An AI rep trained for high-ticket consulting sales</h2>
                    <p className="text-muted-foreground">Move beyond static bios with an AI rep that handles objections, pre-qualifies leads, and gets the right prospects onto your calendar.</p>
                </motion.div>
                <div className="@xl:grid-cols-3 mt-12 grid grid-cols-2 gap-6 text-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-3 border-t pt-6"
                    >
                        <Lightbulb className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-5">
                            <span className="text-foreground font-medium">Qualify Leads</span> Your agent asks consultative questions, scores lead intent, and captures the details you need before the first call.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-3 border-t pt-6"
                    >
                        <Pencil className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-5">
                            <span className="text-foreground font-medium">Handle Sales Objections</span> Train it on offers, case studies, and pricing so prospects trust your value before they talk to you.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-3 border-t pt-6"
                    >
                        <PencilRuler className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-5">
                            <span className="text-foreground font-medium">Fill Your Calendar</span> Connect booking links so qualified visitors can move from conversation to discovery call without waiting for a reply.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
