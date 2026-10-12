"use client";

import Image from "next/image";
import { useState } from "react";
import { GalleryZoomDialog } from "./project-gallery-zoom-dialog";

interface SlideShowProps {
  images: string[];
  /** Kept for the case-study data; every variant now renders as a strip of phone screens. */
  variant?: "web" | "mobile" | "mobile-multi" | "playstore";
}

/** Fired when a screen is hovered or focused, so the case study's sticky phone can show it. */
export const CASE_SHOT_EVENT = "case-shot";

/**
 * Case-study gallery: a swipeable strip of phone screens (native scroll-snap).
 * Click opens the zoom dialog; `data-shots` lets the sticky phone pick up this gallery when it's in view.
 */
const SlideShow = ({ images }: SlideShowProps) => {
  const [selectedImage, setSelectedImage] = useState("");
  const show = (src: string) => window.dispatchEvent(new CustomEvent(CASE_SHOT_EVENT, { detail: src }));

  return (
    <>
      <ul className="case-gallery" data-shots={JSON.stringify(images)} aria-label="App screens">
        {images.map((image, idx) => (
          <li key={image}>
            <button
              type="button"
              className="case-shot"
              onClick={() => setSelectedImage(image)}
              onPointerEnter={() => show(image)}
              onFocus={() => show(image)}
              aria-label={`Zoom screen ${idx + 1} of ${images.length}`}
            >
              <Image src={image} alt="" fill className="object-cover object-top" sizes="180px" />
            </button>
          </li>
        ))}
      </ul>

      <GalleryZoomDialog selectedImage={selectedImage} onClose={() => setSelectedImage("")} />
    </>
  );
};

export default SlideShow;
