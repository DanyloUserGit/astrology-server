import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GoogleSheetsService {
  private sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../credentials/google-sheets-astro.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async getSheetData(spreadsheetId: string, range: string) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values;
  }

  async appendRow( email:string) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId:process.env.SHEET_ID,
      range:"Sheet1",
      valueInputOption: 'RAW',
      requestBody: {
        values: [[email]],
      },
    });

    return { message: 'Row added successfully' };
  }
}
