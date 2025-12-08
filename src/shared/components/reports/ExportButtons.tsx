'use client';

import { Download, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { exportService, ReportType, ExportFormat } from '@/shared/services/exportService';
import { toast } from 'sonner';
import { useState } from 'react';
import { FileSpreadsheet, Presentation } from 'lucide-react';

interface ExportButtonsProps {
  reportType: ReportType;
  reportId: string;
  reportStatus?: string;
}

export function ExportButtons({ reportType, reportId, reportStatus }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await exportService.downloadReport(reportType, reportId, format);
      toast.success(`Reporte exportado como ${format.toUpperCase()} exitosamente`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(`Error al exportar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Determine which formats are available based on report type
  const showPptx = reportType === 'flash-reports';
  const showXlsx = reportType === 'root-cause';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="gap-2 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('docx')}
          disabled={isExporting}
          className="gap-2 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          Exportar como DOCX
        </DropdownMenuItem>
        {showPptx && (
          <DropdownMenuItem
            onClick={() => handleExport('pptx')}
            disabled={isExporting}
            className="gap-2 cursor-pointer"
          >
            <Presentation className="h-4 w-4" />
            Exportar como PPTX
          </DropdownMenuItem>
        )}
        {showXlsx && (
          <DropdownMenuItem
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
            className="gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar como XLSX
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
