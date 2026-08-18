interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  theme?: "light" | "dark";
}

export default function SectionHeader({
  tag,
  title,
  description,
  theme = "light",
}: SectionHeaderProps) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-16" data-gsap="fade-up">
      {tag && (
        <h4
          className={
            theme === "light"
              ? "text-primary font-bold tracking-wider uppercase text-sm mb-2"
              : "text-accent font-bold tracking-wider uppercase text-sm mb-2"
          }
        >
          {tag}
        </h4>
      )}
      <h2
        className={`text-3xl md:text-4xl font-bold mb-4 ${
          theme === "light" ? "text-navy" : "text-white"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={theme === "light" ? "text-slate-600" : "text-slate-300"}>
          {description}
        </p>
      )}
    </div>
  );
}