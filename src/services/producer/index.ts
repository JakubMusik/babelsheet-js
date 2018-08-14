import to from 'await-to-js';
import * as dotenv from 'dotenv';
import { ILogger } from 'node-common';
import * as schedule from 'node-schedule';
import * as ramda from 'ramda';
import GoogleSheets from '../../shared/google/sheets';
import ITransformer from '../../shared/transformers/transformer';
import TranslationsStorage from '../../shared/translations/translations';
import createContainer from './container';

dotenv.config();

const container = createContainer();

process.on('uncaughtException', err => {
  container.resolve<ILogger>('logger').error(err.toString());
  process.exit(1);
});

process.on('unhandledRejection', err => {
  container.resolve<ILogger>('logger').error(err.toString());
  process.exit(1);
});

function getAuthDataFromEnv(): { [key: string]: string } {
  const { CLIENT_ID, CLIENT_SECRET, SPREADSHEET_ID, SPREADSHEET_NAME, REDIRECT_URI } = process.env;

  if (!(CLIENT_ID && CLIENT_SECRET && SPREADSHEET_ID && SPREADSHEET_NAME && REDIRECT_URI)) {
    throw new Error('Provide .env file with configuration data');
  }

  return {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetName: SPREADSHEET_NAME,
    redirectUri: REDIRECT_URI,
  };
}

async function main() {
  const authData = getAuthDataFromEnv();
  const spreadsheetData = await container.resolve<GoogleSheets>('googleSheets').fetchSpreadsheet(authData);

  const transformedData = await container.resolve<ITransformer>('transformer').transform(spreadsheetData);

  const [, actualTranslations] = await to(
    container.resolve<TranslationsStorage>('translationsStorage').getTranslations([])
  );

  if (!ramda.equals(transformedData, actualTranslations)) {
    await container.resolve<TranslationsStorage>('translationsStorage').clearTranslations();
    await container.resolve<TranslationsStorage>('translationsStorage').setTranslations([], transformedData);

    container.resolve<ILogger>('logger').info('Translations were refreshed');
  }
}

const everyFiveMinutes = '*/5 * * * *';

schedule.scheduleJob(everyFiveMinutes, () => {
  main();
});
