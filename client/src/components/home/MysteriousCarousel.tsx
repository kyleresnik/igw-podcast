import React, { useState, useEffect, useMemo, CSSProperties } from 'react';

const MysteriousCarousel = () => {
  // Memoize images array to prevent unnecessary re-renders
  const images = useMemo(
    () => [
      { src: '/dr-mabuse-seance.jpg', alt: 'Dr. Mabuse Seance' },
      { src: '/loch-ness-monster.jpg', alt: 'Loch Ness Monster' },
      { src: '/patterson-gimlin.jpg', alt: 'Patterson-Gimlin Film' },
      { src: '/roswell-debris.jpg', alt: 'Roswell Debris' },
      { src: '/skull-and-bones.PNG', alt: 'Skull and Bones' },
      { src: '/ufo-photo-1.jpg', alt: 'UFO Photo 1' },
      { src: '/ufo-photo-2.jpg', alt: 'UFO Photo 2' },
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])); // Track loaded images
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set()); // Track failed images

  // Preload next image - now with stable dependencies
  const preloadImage = React.useCallback(
    (index: number) => {
      if (loadedImages.has(index) || imageErrors.has(index)) return;

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(Array.from(prev).concat(index)));
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${images[index].src}`);
        setImageErrors(prev => new Set(Array.from(prev).concat(index)));
      };
      img.src = images[index].src;
    },
    [images, loadedImages, imageErrors]
  );

  // Preload images on mount and when index changes
  useEffect(() => {
    // Preload current and next few images
    for (let i = 0; i < Math.min(3, images.length); i++) {
      const indexToLoad = (currentIndex + i) % images.length;
      preloadImage(indexToLoad);
    }
  }, [currentIndex, images.length, preloadImage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;

        // Preload the image after next
        const preloadIndex = (nextIndex + 1) % images.length;
        preloadImage(preloadIndex);

        return nextIndex;
      });
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length, preloadImage]);

  const handleImageError = (index: number) => {
    console.error(`Image failed to load: ${images[index].src}`);
    setImageErrors(prev => new Set(Array.from(prev).concat(index)));
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(Array.from(prev).concat(index)));
  };

  return (
    <div style={carouselContainerStyle}>
      <div style={carouselWrapperStyle}>
        <div
          style={{
            ...carouselTrackStyle,
            width: `${images.length * 100}%`,
            transform: `translateX(-${currentIndex * (100 / images.length)}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              style={{
                ...carouselSlideStyle,
                width: `${100 / images.length}%`,
              }}
            >
              <div style={imageContainerStyle}>
                {imageErrors.has(index) ? (
                  // Fallback content for failed images
                  <div style={imageFallbackStyle}>
                    <div style={fallbackIconStyle}>📷</div>
                    <div style={fallbackTextStyle}>Image unavailable</div>
                    <div style={fallbackSubtextStyle}>{image.alt}</div>
                  </div>
                ) : (
                  <>
                    <img
                      src={image.src}
                      alt={image.alt}
                      style={{
                        ...imageStyle,
                        opacity: loadedImages.has(index) ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                      }}
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                      loading="eager" // Load images immediately for carousel
                    />
                    {!loadedImages.has(index) && (
                      <div style={loadingPlaceholderStyle}>
                        <div style={loadingSpinnerStyle}></div>
                      </div>
                    )}
                  </>
                )}
                <div style={newspaperFilterStyle}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={debugInfoStyle}>
          <small>
            Current: {currentIndex + 1}/{images.length} | Loaded:{' '}
            {loadedImages.size} | Errors: {imageErrors.size}
          </small>
        </div>
      )}
    </div>
  );
};

// Styles
const carouselContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '800px',
  margin: '2rem auto',
  position: 'relative',
  borderRadius: '15px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  background: '#1a1a1a',
};

const carouselWrapperStyle: CSSProperties = {
  width: '100%',
  height: '400px',
  overflow: 'hidden',
  position: 'relative',
};

const carouselTrackStyle: CSSProperties = {
  display: 'flex',
  height: '100%',
  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  willChange: 'transform',
};

const carouselSlideStyle: CSSProperties = {
  height: '100%',
  flexShrink: 0,
  position: 'relative',
};

const imageContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
};

const imageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  filter: 'sepia(0.2) contrast(1.1) brightness(0.9)',
  transition: 'transform 0.3s ease',
};

// Old newspaper grain filter overlay
const newspaperFilterStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0.15,
  mixBlendMode: 'multiply',
  background: `
    radial-gradient(circle at 20% 80%, transparent 50%, rgba(120, 119, 108, 0.3) 100%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 50%, transparent 100%),
    radial-gradient(circle at 40% 40%, transparent 50%, rgba(120, 119, 108, 0.2) 100%),
    repeating-conic-gradient(from 0deg, transparent, transparent 1deg, rgba(0, 0, 0, 0.03) 1deg, rgba(0, 0, 0, 0.03) 2deg),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 3px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.02) 2px,
      rgba(0, 0, 0, 0.02) 3px
    )
  `,
  pointerEvents: 'none',
};

const indicatorsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem',
  gap: '0.5rem',
  background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.3))',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
};

const indicatorDotStyle: CSSProperties = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  border: '2px solid rgba(255, 255, 255, 0.5)',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  opacity: 0.6,
};

const activeIndicatorStyle: CSSProperties = {
  background: 'rgba(220, 38, 38, 0.8)',
  borderColor: '#dc2626',
  opacity: 1,
  transform: 'scale(1.2)',
};

// Additional styles for error handling and loading states
const imageFallbackStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
  color: '#888',
};

const fallbackIconStyle: CSSProperties = {
  fontSize: '3rem',
  marginBottom: '1rem',
  opacity: 0.5,
};

const fallbackTextStyle: CSSProperties = {
  fontSize: '1rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
};

const fallbackSubtextStyle: CSSProperties = {
  fontSize: '0.8rem',
  opacity: 0.7,
  textAlign: 'center',
};

const loadingPlaceholderStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#1a1a1a',
};

const loadingSpinnerStyle: CSSProperties = {
  width: '40px',
  height: '40px',
  border: '3px solid rgba(255, 255, 255, 0.1)',
  borderTop: '3px solid #dc2626',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const debugInfoStyle: CSSProperties = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '5px',
  fontSize: '12px',
  zIndex: 10,
};

export default MysteriousCarousel;
