import type { ContactItem } from "../types";

interface ContactProps {
  items: ContactItem[];
}

export default function Contact({ items }: ContactProps) {
  return (
    <section aria-labelledby="contact-title">
      <h3 id="contact-title">Contact</h3>
      <dl className="contacts">
        {items.map(({ label, value, href }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer">
                  {value}
                </a>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
