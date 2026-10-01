interface Props {
  total: number;
}

export default function DashboardHeader({ total }: Props) {
  console.log("[render] DashboardHeader");
  return (
    <header className="header">
      <h1>Guild Roster</h1>
      <p>
        {total === 0
          ? "Your roster is empty. Recruit your first character."
          : `${total} character${total === 1 ? "" : "s"} ready for adventure.`}
      </p>
    </header>
  );
}
