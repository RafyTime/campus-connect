import type { Page } from '@playwright/test';

/** Picks an option from one of the Event form's styled selects. */
export async function chooseOption(page: Page, label: string, option: string) {
	await page.getByLabel(label, { exact: true }).click();
	await page.getByRole('option', { name: option, exact: true }).click();
}

export async function usePlainTextLocation(page: Page, label: string) {
	await page.getByRole('tab', { name: 'Plain text' }).click();
	await page.getByLabel('Location label', { exact: true }).fill(label);
}
