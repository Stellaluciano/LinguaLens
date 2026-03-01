interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onMouseUp: () => void;
}

export const Editor = ({ value, onChange, onMouseUp }: EditorProps) => {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-nordic-border bg-nordic-panel shadow-panel">
      <header className="border-b border-nordic-border px-6 py-4">
        <h2 className="text-lg font-semibold text-nordic-text">Reader</h2>
        <p className="mt-1 text-sm text-nordic-muted">Paste a foreign-language passage and select one sentence.</p>
      </header>
      <div className="flex-1 p-6">
        <textarea
          className="h-full min-h-[540px] w-full resize-none rounded-xl border border-nordic-border bg-[#fbfcfb] p-5 text-lg leading-8 text-nordic-text outline-none transition focus:border-nordic-accent"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onMouseUp={onMouseUp}
          placeholder="Paste text here, then highlight one sentence to analyze..."
        />
      </div>
    </section>
  );
};
