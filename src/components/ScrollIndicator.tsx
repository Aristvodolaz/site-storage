import React, { useState, useEffect, useRef } from 'react';
import { Box, LinearProgress, Typography, Fade } from '@mui/material';
import { TouchApp } from '@mui/icons-material';

interface ScrollIndicatorProps {
  children: React.ReactNode;
  showHint?: boolean;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  children,
  showHint = true,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateScrollInfo = () => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    
    if (maxScroll > 0) {
      const progress = (scrollLeft / maxScroll) * 100;
      setScrollProgress(progress);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < maxScroll);
    } else {
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollInfo();
      setShowScrollHint(false); // Скрываем подсказку после первого скролла
    };

    const handleResize = () => {
      updateScrollInfo();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Инициализация
    updateScrollInfo();

    // Таймер для автоматического скрытия подсказки
    const hintTimer = setTimeout(() => {
      setShowScrollHint(false);
    }, 5000);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(hintTimer);
    };
  }, []);

  const hasHorizontalScroll = canScrollLeft || canScrollRight;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Индикатор прогресса скролла */}
      {hasHorizontalScroll && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            height: '3px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <LinearProgress
            variant="determinate"
            value={scrollProgress}
            sx={{
              height: '3px',
              backgroundColor: 'transparent',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'primary.main',
              },
            }}
          />
        </Box>
      )}

      {/* Подсказка о горизонтальном скролле */}
      {showHint && hasHorizontalScroll && showScrollHint && (
        <Fade in={showScrollHint} timeout={1000}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: 16,
              transform: 'translateY(-50%)',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontSize: '0.875rem',
              pointerEvents: 'none',
            }}
          >
            <TouchApp fontSize="small" />
            <Typography variant="body2">
              Прокрутите горизонтально
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Индикаторы направления скролла */}
      {hasHorizontalScroll && (
        <>
          {/* Левый градиент */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '20px',
              background: canScrollLeft
                ? 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)'
                : 'none',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />

          {/* Правый градиент */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '20px',
              background: canScrollRight
                ? 'linear-gradient(to left, rgba(0,0,0,0.1), transparent)'
                : 'none',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        </>
      )}

      {/* Основной контент */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'visible',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
