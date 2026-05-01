import React from "react";

const AuthShell = ({ eyebrow, title, description, children, asideTitle, asideList }) => {
  return (
    <div className="page-shell">
      <section className="container section-space">
        <div className="auth-layout">
          <div className="auth-panel auth-panel-highlight">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
            <div className="auth-aside-card">
              <h2>{asideTitle}</h2>
              <ul className="feature-list">
                {asideList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="auth-panel">{children}</div>
        </div>
      </section>
    </div>
  );
};

export default AuthShell;
