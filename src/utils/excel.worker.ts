/* eslint-disable no-restricted-globals */

import * as XLSX from 'xlsx';


interface WorkerMessage {
  blob: Blob;
  fileName: string;
}

interface WorkerResponse {
  excelBlob?: Blob;
  fileName?: string;
  success: boolean;
  error?: string;
}


self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  try {
    const { blob, fileName } = event.data;
    

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const data = e.target?.result;
        
        const workbook = XLSX.read(data, { type: 'array' });

        const excelBuffer = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'array' 
        });
        

        const excelBlob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        

        const response: WorkerResponse = {
          excelBlob, 
          fileName,
          success: true 
        };
        self.postMessage(response);
      } catch (error: unknown) {
        const response: WorkerResponse = {
          error: error instanceof Error ? error.message : 'Error converting to Excel',
          success: false 
        };
        self.postMessage(response);
      }
    };
    
    fileReader.onerror = () => {
      const response: WorkerResponse = {
        error: 'Error reading file',
        success: false 
      };
      self.postMessage(response);
    };
    
    fileReader.readAsArrayBuffer(blob);
  } catch (error: unknown) {
    const response: WorkerResponse = {
      error: error instanceof Error ? error.message : 'Error processing file',
      success: false 
    };
    self.postMessage(response);
  }
});


export {};
