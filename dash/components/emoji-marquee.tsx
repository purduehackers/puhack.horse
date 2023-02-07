const EmojiMarquee = ({ large }: { large?: boolean }) => (
  <div
    className={`relative w-full lg:max-w-max flex overflow-hidden select-none ${
      large ? "hidden lg:block" : "lg:hidden"
    }`}
  >
    <div className="animate-marquee whitespace-nowrap">
      <span className="text-3xl lg:text-4xl mx-4">🐴</span>
      <span className="text-3xl lg:text-4xl mx-4">🔗</span>
      <span className="text-3xl lg:text-4xl mx-4">🐴</span>
      <span className="text-3xl lg:text-4xl mx-4">🔗</span>
      <span className="text-3xl lg:text-4xl mx-4">🐴</span>
      <span className="text-3xl lg:text-4xl mx-4">🔗</span>
    </div>

    <div className="absolute top-0 animate-marquee2 whitespace-nowrap">
      <span className="text-3xl lg:text-4xl mx-4">🐴</span>
      <span className="text-3xl lg:text-4xl mx-4">🔗</span>
      <span className="text-3xl lg:text-4xl mx-4">🐴</span>
      <span className="text-3xl lg:text-4xl mx-4">🔗</span>
      <span className="text-3xl lg:text-4xl mx-4">🐴</span>
      <span className="text-3xl lg:text-4xl mx-4">🔗</span>
    </div>
  </div>
);

export default EmojiMarquee;
