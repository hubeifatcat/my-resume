import { SITE } from "../../config.js";

export default function ContactSection() {
  return (
    <section className="p-section" id="contact">
      <div className="container">
        <div className="p-section-head">
          <span className="p-num">08</span>
          <h2>聊聊吗</h2>
        </div>
        <div className="p-contact glass">
          <div><span>邮箱</span><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
          <div><span>电话</span><a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a></div>
          <div><span>微信</span>{SITE.wechat}</div>
          <div><span>GitHub</span><a href={SITE.github} target="_blank" rel="noreferrer">hubeifatcat</a></div>
        </div>
      </div>
    </section>
  );
}
