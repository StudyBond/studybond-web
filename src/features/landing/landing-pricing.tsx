import {
  formatNaira,
  formatPlanLength,
  planForBoard,
  type BoardPremiumPlan,
} from "@/lib/premium/plans";

/* Free, then one receipt per exam. Prices and plan lengths are whatever the
   admin set on each board (see getPremiumPlans), baked into the page on the
   server, so the price is in the HTML search engines read. */

type Receipt = {
  code: string;
  title: string;
  forWho: string;
  cta: string;
  primary: boolean;
};

const RECEIPTS: Receipt[] = [
  { code: "JAMB", title: "JAMB UTME", forWho: "For JAMB candidates", cta: "Get JAMB premium", primary: true },
  { code: "UI", title: "UI Post-UTME", forWho: "For UI candidates", cta: "Get UI premium", primary: false },
];

export function LandingPricing({ plans }: { plans: BoardPremiumPlan[] }) {
  return (
    <section className="sec" id="pricing">
      <div className="wrap">
        <div className="sec-h">
          <h2>Start free. Pay for your exam only.</h2>
          <p>Premium is paid for one exam at a time. JAMB premium covers JAMB. UI premium covers the UI Post-UTME.</p>
        </div>
        <div className="prices">
          <div className="freebox">
            <h3>
              Free <span>for any exam</span>
            </h3>
            <p>
              One full paper for your exam, with up to 3 tries. The daily challenge, every day. Taster duels. Your
              streak, freezes, the league and today&apos;s words.
            </p>
            <p>No card needed.</p>
            <a className="btn btn-s" href="/signup">
              Start free
            </a>
          </div>
          {RECEIPTS.map((receipt) => {
            const plan = planForBoard(plans, receipt.code);
            return (
              <article key={receipt.code} className="receipt">
                <div className="rc-h">
                  <b>
                    Study<span>Bond</span>
                  </b>
                  <em>Premium</em>
                </div>
                <p className="rc-for">
                  {receipt.title}
                  <small>{receipt.forWho}</small>
                </p>
                <div className="lines">
                  <p className="ln">
                    Full papers<b>up to 5 a day</b>
                  </p>
                  <p className="ln">
                    Or single subjects<b>up to 20 a day</b>
                  </p>
                  <p className="ln">
                    Full-paper duels<b>included</b>
                  </p>
                  <p className="ln">
                    Saved questions and words<b>included</b>
                  </p>
                  <p className="ln">
                    Valid for<b>{formatPlanLength(plan.durationMonths)}</b>
                  </p>
                </div>
                <div className="total">
                  <span>Total</span>
                  <b>{formatNaira(plan.priceNaira)}</b>
                </div>
                <a className={receipt.primary ? "btn btn-p" : "btn btn-s"} href={`/signup?board=${receipt.code}`}>
                  {receipt.cta}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
