import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { FilterOptions, FilterType } from '@/types/item';
import { getFilterTypeLabel } from '@/utils/filters';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const filterTypes: FilterType[] = [
  'all',
  'shk',
  'article',
  'cell',
  'cellName',
  'name',
  'executor',
  'condition',
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: event.target.value,
    });
  };

  const handleFilterTypeChange = (event: SelectChangeEvent<FilterType>) => {
    onFiltersChange({
      ...filters,
      filterType: event.target.value as FilterType,
    });
  };

  const handleWarehouseChange = (event: SelectChangeEvent<number>) => {
    onFiltersChange({
      ...filters,
      warehouse: event.target.value as number,
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Поиск и фильтры
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Поиск"
            placeholder="Введите артикул, ШК, название товара или ячейку для поиска"
            value={filters.search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Тип поиска</InputLabel>
            <Select
              value={filters.filterType}
              label="Тип поиска"
              onChange={handleFilterTypeChange}
            >
              {filterTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {getFilterTypeLabel(type)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Склад</InputLabel>
            <Select
              value={filters.warehouse}
              label="Склад"
              onChange={handleWarehouseChange}
            >
              <MenuItem value={1383}>Склад 1383</MenuItem>
              <MenuItem value={85}>Склад 85</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};
