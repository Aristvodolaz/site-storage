import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
  Info,
} from '@mui/icons-material';

interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showInfo?: boolean;
}

export const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100, 200],
  showInfo = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  const handlePageSizeChange = (event: any) => {
    onPageSizeChange(Number(event.target.value));
    onPageChange(0); // Сбрасываем на первую страницу при изменении размера
  };

  const renderPageNumbers = () => {
    const maxVisiblePages = isMobile ? 3 : 5;
    const pages = [];
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Корректируем startPage если endPage достиг максимума
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Показываем первую страницу и многоточие если нужно
    if (startPage > 0) {
      pages.push(
        <IconButton
          key={0}
          size="small"
          onClick={() => onPageChange(0)}
          sx={{
            minWidth: '32px',
            height: '32px',
            mx: 0.25,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
          }}
        >
          1
        </IconButton>
      );
      
      if (startPage > 1) {
        pages.push(
          <Typography key="ellipsis1" sx={{ mx: 1, alignSelf: 'center' }}>
            ...
          </Typography>
        );
      }
    }

    // Показываем видимые страницы
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <IconButton
          key={i}
          size="small"
          onClick={() => onPageChange(i)}
          sx={{
            minWidth: '32px',
            height: '32px',
            mx: 0.25,
            backgroundColor: i === currentPage ? 'primary.main' : 'transparent',
            color: i === currentPage ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              backgroundColor: i === currentPage 
                ? 'primary.dark' 
                : 'rgba(25, 118, 210, 0.08)',
            },
          }}
        >
          {i + 1}
        </IconButton>
      );
    }

    // Показываем многоточие и последнюю страницу если нужно
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push(
          <Typography key="ellipsis2" sx={{ mx: 1, alignSelf: 'center' }}>
            ...
          </Typography>
        );
      }
      
      pages.push(
        <IconButton
          key={totalPages - 1}
          size="small"
          onClick={() => onPageChange(totalPages - 1)}
          sx={{
            minWidth: '32px',
            height: '32px',
            mx: 0.25,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
          }}
        >
          {totalPages}
        </IconButton>
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: 2,
        p: 2,
        borderTop: '1px solid rgba(224, 224, 224, 1)',
        backgroundColor: 'rgba(248, 249, 250, 1)',
        minHeight: '64px',
      }}
    >
      {/* Информация о записях */}
      {showInfo && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {isMobile 
              ? `${startItem}-${endItem} из ${totalItems}`
              : `Показано ${startItem}-${endItem} из ${totalItems} записей`
            }
          </Typography>
          <Chip
            label={`Страница ${currentPage + 1}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Box>
      )}

      {/* Навигация по страницам */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Первая страница */}
        <IconButton
          size="small"
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          title="Первая страница"
        >
          <FirstPage />
        </IconButton>

        {/* Предыдущая страница */}
        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          title="Предыдущая страница"
        >
          <NavigateBefore />
        </IconButton>

        {/* Номера страниц */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderPageNumbers()}
          </Box>
        )}

        {/* Следующая страница */}
        <IconButton
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          title="Следующая страница"
        >
          <NavigateNext />
        </IconButton>

        {/* Последняя страница */}
        <IconButton
          size="small"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          title="Последняя страница"
        >
          <LastPage />
        </IconButton>
      </Box>

      {/* Размер страницы */}
      <FormControl size="small" sx={{ minWidth: isMobile ? 80 : 120 }}>
        <InputLabel>На странице</InputLabel>
        <Select
          value={pageSize}
          label="На странице"
          onChange={handlePageSizeChange}
        >
          {pageSizeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
