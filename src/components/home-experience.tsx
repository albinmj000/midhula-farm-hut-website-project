"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { ArrowDown, ArrowDownRight, ArrowUpRight, Camera, MapPin, Menu, MessageCircle, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const instagramUrl = "https://www.instagram.com/midhula_farm_hut/";
const platiesHighlightUrl = "https://www.instagram.com/stories/highlights/17905741892210402/";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Fish Gallery", href: "#gallery" },
  { label: "Explore", href: "#explore" },
  { label: "Contact", href: "#contact" },
];

function subscribeToMotionPreference(onChange: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function getMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type MagneticLinkProps = {
  href: string;
  children: ReactNode;
  className: string;
  external?: boolean;
  onClick?: () => void;
};

function MagneticLink({
  href,
  children,
  className,
  external = false,
  onClick,
}: MagneticLinkProps) {
  const move = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left - bounds.width / 2) * 0.08;
    const offsetY = (event.clientY - bounds.top - bounds.height / 2) * 0.08;
    event.currentTarget.style.setProperty("--mag-x", `${offsetX}px`);
    event.currentTarget.style.setProperty("--mag-y", `${offsetY}px`);
  };

  const reset = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.setProperty("--mag-x", "0px");
    event.currentTarget.style.setProperty("--mag-y", "0px");
  };

  return (
    <a
      className={`${className} magnetic-link`}
      href={href}
      onClick={onClick}
      onPointerLeave={reset}
      onPointerMove={move}
      rel={external ? "noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {children}
    </a>
  );
}

function BrandMark() {
  return (
    <span className="brand__mark" aria-hidden="true">
      <Image
        alt=""
        className="brand__mark-image"
        height={671}
        sizes="72px"
        src="/midhula-logo.png"
        width={676}
      />
    </span>
  );
}

function AutoplayVideo({
  src,
  poster,
  label,
  decorative = false,
}: {
  src: string;
  poster?: string;
  label?: string;
  decorative?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set the media properties before requesting playback. iOS checks these
    // properties when deciding whether an autoplay request is allowed.
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    let attempts = 0;
    let requestPending = false;
    const attemptPlayback = () => {
      if (!video.paused || requestPending || attempts >= 2) return;

      attempts += 1;
      requestPending = true;
      // Try once on mount and at most once more when media is ready. Consume
      // rejections and expose a native control so the user can start playback.
      void video.play().then(() => {
        requestPending = false;
      }).catch((error: unknown) => {
        requestPending = false;
        if (video.isConnected) {
          video.dataset.autoplayError =
            error instanceof DOMException ? error.name : "PlaybackError";
          setShowControls(true);
        }
      });
    };
    const retryWhenReady = () => {
      if (attempts === 1) attemptPlayback();
    };
    const exposeControlsOnMediaError = () => {
      video.dataset.videoError = String(video.error?.code ?? "unknown");
      setShowControls(true);
    };
    const clearPlaybackError = () => delete video.dataset.autoplayError;

    video.addEventListener("canplay", retryWhenReady);
    video.addEventListener("error", exposeControlsOnMediaError);
    video.addEventListener("playing", clearPlaybackError);
    attemptPlayback();
    return () => {
      video.removeEventListener("canplay", retryWhenReady);
      video.removeEventListener("error", exposeControlsOnMediaError);
      video.removeEventListener("playing", clearPlaybackError);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      controls={showControls}
      className={showControls ? "autoplay-video--controls" : undefined}
      preload="metadata"
      poster={poster}
      aria-label={label}
      aria-hidden={decorative || undefined}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 801px)");
    const closeMenu = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    closeMenu();
    desktop.addEventListener("change", closeMenu);
    return () => desktop.removeEventListener("change", closeMenu);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#home" aria-label="Midhula Farm Hut home">
          <BrandMark />
          <span className="brand__wordmark">
            <strong>MIDHULA</strong>
            <small>FARM HUT</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <MagneticLink
          className="header-instagram"
          external
          href={instagramUrl}
        >
          <Camera size={15} />
          <span>Instagram</span>
        </MagneticLink>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mobile-nav-wrap"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={instagramUrl}
                onClick={() => setMenuOpen(false)}
                rel="noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Preloader({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={{ opacity: 1 }}
          className="preloader"
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
          initial={{ opacity: 1 }}
          aria-label="Loading Midhula Farm Hut"
          role="status"
        >
          <div className="preloader__particles" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span className="preloader__particle" key={index} />
            ))}
          </div>
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="preloader__inner"
            initial={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <BrandMark />
            <span className="preloader__name">Midhula Farm Hut</span>
            <span className="preloader__track" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FishCard({
  number,
  label,
  title,
  description,
  href,
  image,
  alt,
  video,
  poster,
  videoLabel,
  reducedMotion,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
  href: string;
  image?: string;
  alt?: string;
  video?: string;
  poster?: string;
  videoLabel?: string;
  reducedMotion: boolean;
}) {
  return (
    <motion.article
      className="fish-card"
      whileHover={reducedMotion ? undefined : { y: -5 }}
      transition={{ duration: 0.25 }}
    >
      <a href={href} rel="noreferrer" target="_blank" aria-label={`Explore ${title} on Instagram`}>
        <div className="fish-card__media">
          {video ? (
            <AutoplayVideo
              src={video}
              poster={poster}
              label={videoLabel ?? "Video from Midhula Farm Hut's platies highlight"}
            />
          ) : (
            <Image
              alt={alt ?? "Ornamental fish from Midhula Farm Hut"}
              fill
              quality={90}
              sizes="(max-width: 520px) 90vw, (max-width: 800px) 44vw, 30vw"
              src={image ?? "/midhula-goldfish.png"}
            />
          )}
          <span className="fish-card__index">{number}</span>
          <div className="fish-card__content">
            <div>
              <p className="fish-card__label">{label}</p>
              <h3 className="fish-card__title">{title}</h3>
              <p className="fish-card__description">{description}</p>
            </div>
            <span className="fish-card__arrow" aria-hidden="true">
              <ArrowUpRight size={17} />
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}

function GalleryTile({
  href,
  image,
  video,
  poster,
  alt,
  label,
  className = "",
  ariaLabel,
}: {
  href: string;
  image?: string;
  video?: string;
  poster?: string;
  alt: string;
  label: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      className={`gallery-item clip-reveal ${className}`}
      href={href}
      rel="noreferrer"
      target="_blank"
      aria-label={ariaLabel ?? `View ${label} on Instagram`}
    >
      {video ? (
        <AutoplayVideo src={video} poster={poster} label={alt} />
      ) : (
        <Image
          alt={alt}
          fill
          quality={90}
          sizes="(max-width: 800px) 48vw, 35vw"
          src={image ?? "/midhula-goldfish.png"}
        />
      )}
      <span className="gallery-item__label">
        {label}
        <ArrowUpRight size={15} />
      </span>
    </a>
  );
}

export default function HomeExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    () => false,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setLoading(false),
      prefersReducedMotion ? 0 : 950,
    );
    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      root.querySelectorAll<HTMLElement>(".reveal-up").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      const fishGrid = root.querySelector<HTMLElement>(".fish-grid");
      if (fishGrid) {
        gsap.fromTo(
          fishGrid.querySelectorAll(".fish-card"),
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.14,
            ease: "power2.out",
            scrollTrigger: {
              trigger: fishGrid,
              start: "top 84%",
              once: true,
            },
          },
        );
      }

      root.querySelectorAll<HTMLElement>(".clip-reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 0.9,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          },
        );
      });

      if (window.matchMedia("(min-width: 900px)").matches) {
        const heroImage = root.querySelector<HTMLElement>(".hero__image-inner");
        if (heroImage) {
          gsap.to(heroImage, {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }
      }
    }, root);

    return () => context.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (
      !cursor ||
      prefersReducedMotion ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    document.body.classList.add("cursor-active");
    const moveCursor = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      cursor.classList.add("cursor--visible");
      if (event.target instanceof Element && event.target.closest("a, button")) {
        cursor.classList.add("cursor--hover");
      } else {
        cursor.classList.remove("cursor--hover");
      }
    };
    const hideCursor = () => cursor.classList.remove("cursor--visible");

    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("blur", hideCursor);
    return () => {
      document.body.classList.remove("cursor-active");
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("blur", hideCursor);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Preloader visible={loading} />
      <SiteHeader />
      <main id="main-content" ref={rootRef}>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero__image" aria-hidden="true">
            <div className="hero__image-inner">
              <AutoplayVideo
                src="/mp4%20background.mp4"
                poster="/midhula-ornamental-poster.png"
                decorative
              />
            </div>
          </div>
          <div className="particles" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <span
                className="particle"
                key={index}
                style={{ "--particle-position": index } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="hero__content">
            <p className="eyebrow">
              <span className="eyebrow__dot" />
              Peechi, Thrissur, Kerala
            </p>
            <motion.h1
              animate={{ opacity: 1 }}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              id="hero-title"
            >
              <span>
                <motion.span
                  animate={{ y: 0 }}
                  initial={prefersReducedMotion ? false : { y: "110%" }}
                  transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  A little
                </motion.span>
              </span>
              <span>
                <motion.span
                  animate={{ y: 0 }}
                  initial={prefersReducedMotion ? false : { y: "110%" }}
                  transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  world <em>of</em>
                </motion.span>
              </span>
              <span>
                <motion.span
                  animate={{ y: 0 }}
                  initial={prefersReducedMotion ? false : { y: "110%" }}
                  transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  extraordinary
                </motion.span>
              </span>
              <span className="hero__last-line">
                <motion.span
                  animate={{ y: 0 }}
                  initial={prefersReducedMotion ? false : { y: "110%" }}
                  transition={{ duration: 0.75, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                >
                  life.
                </motion.span>
              </span>
            </motion.h1>
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="hero__copy"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover the fascinating beauty of ornamental fish at Midhula Farm Hut.
            </motion.p>
            <div className="hero__actions">
              <MagneticLink className="button button--primary" href="#explore">
                Explore Our World <ArrowDownRight size={16} />
              </MagneticLink>
              <MagneticLink
                className="button button--outline"
                external
                href={instagramUrl}
              >
                <Camera size={15} /> Instagram
              </MagneticLink>
            </div>
          </div>
          <div className="hero__side-note" aria-hidden="true">
            <span>Life beneath the surface</span>
          </div>
          <div className="hero__bottom">
            <span>Ornamental fish · Aquarium life</span>
            <a href="#about">
              Scroll to explore <ArrowDown size={14} />
            </a>
            <span>Peechi · Kerala</span>
          </div>
        </section>

        <section className="about section-pad" id="about" aria-labelledby="about-title">
          <div className="section-inner about__grid">
            <div className="about__image-wrap reveal-up clip-reveal">
              <AutoplayVideo
                src="/Recording%202.mp4"
                poster="/midhula-lobster-poster.png"
                label="Red lobster carrying eggs in Midhula Farm Hut's breeding footage"
              />
              <span className="about__image-tag">A closer look at aquatic life</span>
            </div>
            <div className="about__copy reveal-up">
              <p className="eyebrow">
                <span className="eyebrow__dot" />
                A little introduction
              </p>
              <h2 id="about-title">
                From Peechi, <em>with wonder.</em>
              </h2>
              <p>
                Midhula Farm Hut is an ornamental fish-focused world in Peechi,
                Thrissur, Kerala. Its Instagram profile brings guppies, platies
                and aquarium life into close view.
              </p>
              <p>
                A place to pause, look closer and discover the color and character
                of life beneath the surface.
              </p>
              <a className="text-link" href={instagramUrl} rel="noreferrer" target="_blank">
                Meet us on Instagram <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="explore section-pad" id="explore" aria-labelledby="explore-title">
          <div className="section-inner">
            <div className="section-heading reveal-up">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__dot" />
                  The aquatic world
                </p>
                <h2 className="section-heading__title" id="explore-title">
                  Small lives. <em>Endless colour.</em>
                </h2>
              </div>
              <p className="section-heading__note">
                Explore the fish and aquarium moments shared by Midhula Farm Hut.
              </p>
            </div>

            <div className="fish-grid">
              <FishCard
                number="01"
                label="Guppies highlight"
                title="Guppies"
                description="A flash of bright colour and flowing fins in a lively little fish."
                href="https://www.instagram.com/stories/highlights/17893264145339604/"
                image="/guppy.jpeg"
                alt="Colorful guppies in a green-rimmed net"
                reducedMotion={Boolean(prefersReducedMotion)}
              />
              <FishCard
                number="02"
                label="Platies highlight"
                title="Platies"
                description="Bright patterns and easygoing movement bring a cheerful spark to freshwater life."
                href={platiesHighlightUrl}
                video="/midhula-platies-story.mp4"
                poster="/midhula-platies-poster.png"
                reducedMotion={Boolean(prefersReducedMotion)}
              />
              <FishCard
                number="03"
                label="From the profile"
                title="Ornamental fish"
                description="Discover vivid patterns, graceful fins and character beneath the surface."
                href="https://www.instagram.com/midhula_farm_hut/reel/DfZzTJ5xxIG/"
                video="/Recording%201.mp4"
                poster="/midhula-ornamental-poster.png"
                videoLabel="Colorful ornamental fish from Midhula Farm Hut"
                reducedMotion={Boolean(prefersReducedMotion)}
              />
              <FishCard
                number="04"
                label="Aquarium invertebrates"
                title="Shrimp"
                description="A vivid splash of red and delicate detail in a miniature aquatic world."
                href="https://www.instagram.com/midhula_farm_hut/reel/Dfmrb9NRztf/"
                image="/midhula-guppy-planted.jpg"
                alt="Red shrimp from Midhula Farm Hut's Instagram profile"
                reducedMotion={Boolean(prefersReducedMotion)}
              />
            </div>
            <p className="explore__footnote">Media links to the original Midhula Farm Hut posts.</p>
          </div>
        </section>

        <section className="gallery section-pad" id="gallery" aria-labelledby="gallery-title">
          <div className="section-inner">
            <div className="section-heading reveal-up">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__dot" />
                  Frames from the feed
                </p>
                <h2 className="section-heading__title" id="gallery-title">
                  A world in <em>little details.</em>
                </h2>
              </div>
              <p className="section-heading__note">
                A visual collection from the public Midhula Farm Hut profile.
              </p>
            </div>
            <div className="gallery__grid">
              <GalleryTile
                href="https://www.instagram.com/stories/highlights/17893264145339604/"
                image="/guppy.jpeg"
                alt="Colorful guppies in a green-rimmed net"
                label="Guppies"
              />
              <GalleryTile
                href={platiesHighlightUrl}
                video="/midhula-platies-story.mp4"
                poster="/midhula-platies-poster.png"
                alt="Platies featured in Midhula Farm Hut's Instagram highlight"
                label="Platies"
              />
              <GalleryTile
                href="/WhatsApp%20Video%202026-11-14%20at%2010.39.32%20PM.mp4"
                video="/WhatsApp%20Video%202026-11-14%20at%2010.39.32%20PM.mp4"
                poster="/whatsapp-01-poster.png"
                alt="WhatsApp video showing ornamental aquatic life"
                label="Little Lives Growing Beneath Those Golden Fins"
                ariaLabel="Open WhatsApp video 1 in a new tab"
              />
              <GalleryTile
                href="/WhatsApp%20Video%202026-11-14%20at%2010.39.33%20PM.mp4"
                video="/WhatsApp%20Video%202026-11-14%20at%2010.39.33%20PM.mp4"
                poster="/whatsapp-02-poster.png"
                alt="WhatsApp video showing ornamental aquatic life"
                label="Tiny Lives Guarded By A Parent"
                ariaLabel="Open WhatsApp video 2 in a new tab"
              />
              <GalleryTile
                href="/WhatsApp%20Video%202026-11-14%20at%2010.39.34%20PM.mp4"
                video="/WhatsApp%20Video%202026-11-14%20at%2010.39.34%20PM.mp4"
                poster="/whatsapp-03-poster.png"
                alt="WhatsApp video showing ornamental aquatic life"
                label="A Splash Of Red"
                ariaLabel="Open WhatsApp video 3 in a new tab"
              />
              <GalleryTile
                href="/WhatsApp%20Video%202026-11-14%20at%2010.39.39%20PM.mp4"
                video="/WhatsApp%20Video%202026-11-14%20at%2010.39.39%20PM.mp4"
                poster="/whatsapp-04-poster.png"
                alt="WhatsApp video showing ornamental aquatic life"
                label="Carrying The Next Generation Beneath Its Shell"
                ariaLabel="Open WhatsApp video 4 in a new tab"
              />
            </div>
            <a className="gallery__source" href={instagramUrl} rel="noreferrer" target="_blank">
              View the complete collection on Instagram <ArrowUpRight size={14} />
            </a>
          </div>
        </section>

        <section className="why section-pad" aria-labelledby="why-title">
          <div className="section-inner">
            <div className="why__intro reveal-up">
              <p className="eyebrow">
                <span className="eyebrow__dot" />
                Why Midhula Farm Hut
              </p>
              <h2 id="why-title">A little world, <em>all its own.</em></h2>
              <p>
                A closer look at what makes this aquatic corner distinctive: its
                focus, its setting and the small details worth noticing.
              </p>
            </div>
            <div className="why__list">
              <article className="why-item reveal-up">
                <span className="why-item__number">01</span>
                <h3>Ornamental by nature</h3>
                <p>A dedicated focus on ornamental fish and aquarium life.</p>
              </article>
              <article className="why-item reveal-up">
                <span className="why-item__number">02</span>
                <h3>Guppies &amp; platies</h3>
                <p>Two favorite subjects featured in the profile&apos;s highlights.</p>
              </article>
              <article className="why-item reveal-up">
                <span className="why-item__number">03</span>
                <h3>Rooted in Peechi</h3>
                <p>Based in Peechi, in the Thrissur district of Kerala.</p>
              </article>
              <article className="why-item reveal-up">
                <span className="why-item__number">04</span>
                <h3>Live plants</h3>
                <p>Aquatic greenery adds natural color and texture to aquarium life.</p>
              </article>
              <article className="why-item reveal-up">
                <span className="why-item__number">05</span>
                <h3>Shrimp</h3>
                <p>A close look at the vivid red shrimp shared by Midhula Farm Hut.</p>
              </article>
              <article className="why-item reveal-up">
                <span className="why-item__number">06</span>
                <h3>Lobster</h3>
                <p>Breeding footage offers a closer look at a lobster carrying eggs.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="instagram section-pad" aria-labelledby="instagram-title">
          <div className="section-inner instagram__layout">
            <div className="instagram__copy reveal-up">
              <p className="eyebrow">
                <span className="eyebrow__dot" />
                Follow along
              </p>
              <h2 id="instagram-title">
                A living gallery, <em>on Instagram.</em>
              </h2>
              <p>
                Visit <span className="instagram__handle">@midhula_farm_hut</span> for
                more ornamental fish and aquarium moments from Peechi.
              </p>
              <MagneticLink
                className="button button--outline"
                external
                href={instagramUrl}
              >
                <Camera size={15} /> Visit Instagram <ArrowUpRight size={15} />
              </MagneticLink>
            </div>
            <div className="instagram__mosaic reveal-up">
              <a className="instagram__tile" href={instagramUrl} rel="noreferrer" target="_blank" aria-label="Visit Midhula Farm Hut on Instagram">
                <Image alt="Golden ornamental fish from the Midhula Farm Hut Instagram profile" fill sizes="24vw" src="/midhula-goldfish.png" />
              </a>
              <a className="instagram__tile" href={instagramUrl} rel="noreferrer" target="_blank" aria-label="Visit Midhula Farm Hut on Instagram">
                <Image alt="Ornamental fish in a close-up Instagram reel" fill sizes="20vw" src="/midhula-guppy-reel.jpg" />
              </a>
              <a className="instagram__tile" href={instagramUrl} rel="noreferrer" target="_blank" aria-label="Visit Midhula Farm Hut on Instagram">
                <Image alt="Red aquarium shrimp from the Midhula Farm Hut Instagram profile" fill sizes="24vw" src="/midhula-guppy-planted.jpg" />
              </a>
            </div>
          </div>
        </section>

        <section className="contact section-pad" id="contact" aria-labelledby="contact-title">
          <div className="section-inner contact__grid">
            <div className="reveal-up">
              <p className="eyebrow">
                <span className="eyebrow__dot" />
                Get in touch
              </p>
              <h2 id="contact-title">
                Let&apos;s talk <em>fish.</em>
              </h2>
            </div>
            <div className="contact__details reveal-up">
              <p className="contact__detail">
                <MapPin size={17} />
                Peechi, Thrissur, Kerala
              </p>
              <a className="contact__detail" href="https://wa.me/918129120437" rel="noreferrer" target="_blank">
                <MessageCircle size={17} />
                WhatsApp · 8129120437
                <ArrowUpRight size={14} />
              </a>
              <div className="contact__actions">
                <MagneticLink
                  className="button button--primary"
                  external
                  href="https://wa.me/918129120437"
                >
                  Message on WhatsApp <ArrowUpRight size={15} />
                </MagneticLink>
                <MagneticLink
                  className="button button--outline"
                  external
                  href={instagramUrl}
                >
                  Instagram <ArrowUpRight size={15} />
                </MagneticLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__top">
          <a className="brand" href="#home" aria-label="Midhula Farm Hut home">
            <BrandMark />
            <span className="brand__wordmark">
              <strong>MIDHULA</strong>
              <small>FARM HUT</small>
            </span>
          </a>
          <nav className="footer__nav" aria-label="Footer navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="footer__social">
            <a href={instagramUrl} rel="noreferrer" target="_blank" aria-label="Instagram">
              <FaInstagram size={16} aria-hidden="true" />
            </a>
            <a href="https://wa.me/918129120437" rel="noreferrer" target="_blank" aria-label="WhatsApp">
              <FaWhatsapp size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="footer__bottom">
          <span>Midhula Farm Hut · Peechi, Kerala</span>
          <span>Ornamental fish &amp; aquarium life</span>
        </div>
      </footer>
      <span className="cursor" ref={cursorRef} aria-hidden="true" />
    </>
  );
}
