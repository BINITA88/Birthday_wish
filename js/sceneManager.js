/* Scene manager: registration, mounting, tracked cleanup, transitions with a lock. */
(function (App) {
  const scenes = {};
  let current = null;       // { id, sec, ctx }
  let locked = false;

  const stage = () => document.getElementById('stage');
  const veil = () => document.getElementById('veil');
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /** Per-scene context: everything created through it is disposed when the scene ends. */
  function makeCtx() {
    const disposers = [];
    let dead = false;
    const ctx = {
      get dead() { return dead; },
      add(fn) { disposers.push(fn); return fn; },
      later(fn, ms) {
        const id = setTimeout(function () { if (!dead) fn(); }, ms);
        disposers.push(function () { clearTimeout(id); });
        return id;
      },
      /** Promise that simply never resolves if the scene is disposed first – so async flows stop cleanly. */
      sleep(ms) {
        return new Promise(function (res) {
          const id = setTimeout(function () { if (!dead) res(); }, ms);
          disposers.push(function () { clearTimeout(id); });
        });
      },
      on(el, ev, fn, opt) {
        el.addEventListener(ev, fn, opt);
        disposers.push(function () { el.removeEventListener(ev, fn, opt); });
      },
      show(el, ms) { return ctx.later(function () { el.classList.add('in'); }, ms || 0); },
      dispose() {
        dead = true;
        disposers.splice(0).reverse().forEach(function (fn) { try { fn(); } catch (e) { console.warn(e); } });
      }
    };
    return ctx;
  }

  function mount(id, params) {
    const def = scenes[id];
    if (!def) throw new Error('Unknown scene: ' + id);
    const sec = document.createElement('section');
    sec.className = 'scene scene-' + id;
    sec.id = 'scene-' + id;
    stage().appendChild(sec);
    const ctx = makeCtx();
    const inst = { id: id, sec: sec, ctx: ctx };
    def.init(sec, ctx, params || {});
    return inst;
  }

  function unmount(inst) {
    if (!inst) return;
    inst.ctx.dispose();
    const def = scenes[inst.id];
    if (def && def.cleanup) { try { def.cleanup(inst.sec); } catch (e) { console.warn(e); } }
    inst.sec.remove();
  }

  function setVeil(opacity, ms) {
    const v = veil();
    v.style.transition = 'opacity ' + ms + 'ms ease-in-out';
    v.style.pointerEvents = 'all';       // block clicks during every transition
    // force a style flush so the transition always runs
    void v.offsetWidth;
    v.style.opacity = opacity;
    return wait(ms).then(function () { if (opacity === 0) v.style.pointerEvents = 'none'; });
  }

  const SceneManager = {
    register(id, def) { scenes[id] = def; },
    get current() { return current; },
    get locked() { return locked; },

    /**
     * go(id, { mode: 'black' | 'cross' | 'none', duration, hold, params })
     *  black – fade to black, swap, fade back in (default)
     *  cross – new scene fades in over the old one (used where both look alike)
     *  none  – instant (first load)
     */
    async go(id, o) {
      if (locked) return false;
      locked = true;
      o = o || {};
      const mode = o.mode || 'black';
      const dur = App.reduced ? Math.min(o.duration || 1200, 500) : (o.duration || 1200);
      try {
        const old = current;
        let next;
        if (mode === 'cross') {
          next = mount(id, o.params);
          next.sec.style.zIndex = 2;
          next.sec.style.opacity = 0;
          next.sec.style.transition = 'opacity ' + dur + 'ms ease-in-out';
          void next.sec.offsetWidth;
          next.sec.style.opacity = 1;
          await wait(dur);
          unmount(old);
          next.sec.style.cssText = '';
        } else if (mode === 'none') {
          unmount(old);
          next = mount(id, o.params);
        } else {
          await setVeil(1, dur);
          unmount(old);
          next = mount(id, o.params);
          await wait(o.hold == null ? 300 : o.hold);
          await setVeil(0, dur);
        }
        current = next;
        App.state.scene = id;
        return true;
      } finally {
        locked = false;
      }
    },

    /** Full reset for "Relive the Magic". */
    replay() {
      if (locked) return false;
      App.audio.stopAll();
      App.resetState();
      return SceneManager.go('name', { mode: 'black', duration: 1300, hold: 500 });
    }
  };

  App.SceneManager = SceneManager;
})(window.App = window.App || {});
