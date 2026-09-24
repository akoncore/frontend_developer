interface FooterProps {
  name: string;
}

export default function Footer({ name }: FooterProps) {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} {name}. Built with React + TypeScript.</p>
    </footer>
  );
}

