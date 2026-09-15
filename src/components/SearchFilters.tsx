import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Badge,
  Chip,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAltOff as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Print as PrintIcon,
  FileDownload as ExcelIcon,
} from '@mui/icons-material';
import { FilterOptions, FilterType, TriState } from '@/types/item';
import {
  filterTypeLabel,
  countActiveFilters,
  EMPTY_FILTERS,
  NO_EXECUTOR,
  FilterFacets,
} from '@/utils/filters';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  facets: FilterFacets;
  resultCount: number;
  onExport: () => void;
  onPrint: () => void;
}

const filterTypes: FilterType[] = [
  'all', 'shk', 'article', 'cell', 'cellName', 'name', 'executor', 'condition',
];

const triLabels: Record<TriState, string> = { all: 'Все', with: 'Есть', without: 'Нет' };

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  facets,
  resultCount,
  onExport,
  onPrint,
}) => {
  const set = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) =>
    onFiltersChange({ ...filters, [key]: value });

  const activeCount = countActiveFilters(filters);

  const handleReset = () =>
    onFiltersChange({ ...EMPTY_FILTERS, warehouse: filters.warehouse });

  const executorOptions = [
    ...(facets.hasNoExecutor ? [NO_EXECUTOR] : []),
    ...facets.executors,
  ];
  const executorLabel = (v: string) => (v === NO_EXECUTOR ? 'Без исполнителя' : v);

  const tri = (key: 'expiration' | 'reason', label: string) => (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        fullWidth
        value={filters[key]}
        onChange={(_, v: TriState | null) => v && set(key, v)}
      >
        {(['all', 'with', 'without'] as TriState[]).map((v) => (
          <ToggleButton key={v} value={v}>{triLabels[v]}</ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Badge badgeContent={activeCount} color="primary">
          <Typography variant="h6">Поиск и фильтры</Typography>
        </Badge>
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={`Найдено: ${resultCount.toLocaleString('ru-RU')}`}
        />
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleReset}
          disabled={activeCount === 0}
        >
          Сбросить
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={onPrint}
          disabled={resultCount === 0}
        >
          Печать
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<ExcelIcon />}
          onClick={onExport}
          disabled={resultCount === 0}
        >
          Экспорт в Excel
        </Button>
      </Box>

      {/* Быстрый ряд: поиск + область + склад */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Поиск"
            placeholder="Артикул, ШК, название, ячейка, исполнитель…"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>

        <Grid item xs={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Область поиска</InputLabel>
            <Select
              value={filters.filterType}
              label="Область поиска"
              onChange={(e: SelectChangeEvent<FilterType>) =>
                set('filterType', e.target.value as FilterType)}
            >
              {filterTypes.map((type) => (
                <MenuItem key={type} value={type}>{filterTypeLabel(type)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Склад</InputLabel>
            <Select
              value={filters.warehouse}
              label="Склад"
              onChange={(e: SelectChangeEvent<number>) =>
                set('warehouse', e.target.value as number)}
            >
              <MenuItem value={1383}>Склад 1383</MenuItem>
              <MenuItem value={85}>Склад 85</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Accordion disableGutters elevation={0} sx={{ mt: 1, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Расширенные фильтры{activeCount > 0 ? ` (активно: ${activeCount})` : ''}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Состояние</InputLabel>
                <Select
                  value={filters.condition}
                  label="Состояние"
                  onChange={(e) => set('condition', String(e.target.value))}
                >
                  <MenuItem value="all">Любое</MenuItem>
                  {facets.conditions.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                options={facets.prunitNames}
                value={filters.prunitNames}
                onChange={(_, v) => set('prunitNames', v)}
                renderInput={(p) => <TextField {...p} label="ЕХ (ед. хранения)" />}
                limitTags={2}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                options={executorOptions}
                getOptionLabel={executorLabel}
                value={filters.executors}
                onChange={(_, v) => set('executors', v)}
                renderInput={(p) => <TextField {...p} label="Исполнитель" />}
                limitTags={1}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                options={facets.sections}
                value={filters.sections}
                onChange={(_, v) => set('sections', v)}
                renderInput={(p) => <TextField {...p} label="Секции ячеек" />}
                limitTags={3}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                multiple
                size="small"
                options={facets.racks}
                value={filters.racks}
                onChange={(_, v) => set('racks', v)}
                renderInput={(p) => <TextField {...p} label="Стеллажи" />}
                limitTags={3}
              />
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Кол-во от"
                value={filters.qtyMin ?? ''}
                onChange={(e) =>
                  set('qtyMin', e.target.value === '' ? null : Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Кол-во до"
                value={filters.qtyMax ?? ''}
                onChange={(e) =>
                  set('qtyMax', e.target.value === '' ? null : Number(e.target.value))}
              />
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Изменено с"
                InputLabelProps={{ shrink: true }}
                value={filters.updatedFrom}
                onChange={(e) => set('updatedFrom', e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Изменено по"
                InputLabelProps={{ shrink: true }}
                value={filters.updatedTo}
                onChange={(e) => set('updatedTo', e.target.value)}
              />
            </Grid>

            <Grid item xs={6} sm={6} md={2}>{tri('expiration', 'Срок годности')}</Grid>
            <Grid item xs={6} sm={6} md={2}>{tri('reason', 'Причина')}</Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
