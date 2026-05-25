import { BadRequestException } from '@nestjs/common';
import { endOfDay, format, isValid, parse, startOfDay } from 'date-fns';

export const API_DATE_FORMAT = 'dd/MM/yyyy';
export const API_DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

function parseApiDate(value: string, fieldName: string): Date {
  const parsedDate = parse(value, API_DATE_FORMAT, new Date());

  if (!isValid(parsedDate) || format(parsedDate, API_DATE_FORMAT) !== value) {
    throw new BadRequestException(
      `${fieldName} must use the format DD/MM/YYYY`,
    );
  }

  return parsedDate;
}

export function parseApiStartDate(
  value: string,
  fieldName = 'start_date',
): Date {
  return startOfDay(parseApiDate(value, fieldName));
}

export function parseApiEndDate(value: string, fieldName = 'end_date'): Date {
  return endOfDay(parseApiDate(value, fieldName));
}
