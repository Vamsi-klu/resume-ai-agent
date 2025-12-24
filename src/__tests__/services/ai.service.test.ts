import { getAvailableModels, GeminiModel } from '@/lib/services/ai.service';

describe('AI Service', () => {
    describe('getAvailableModels', () => {
        it('should return an array of available models', () => {
            const models = getAvailableModels();
            expect(Array.isArray(models)).toBe(true);
            expect(models.length).toBeGreaterThan(0);
        });

        it('should include all expected model IDs', () => {
            const models = getAvailableModels();
            const modelIds = models.map(m => m.id);

            expect(modelIds).toContain('gemini-1.5-flash');
            expect(modelIds).toContain('gemini-1.5-pro');
            expect(modelIds).toContain('gemini-2.0-flash-exp');
        });

        it('should have required properties for each model', () => {
            const models = getAvailableModels();

            models.forEach(model => {
                expect(model).toHaveProperty('id');
                expect(model).toHaveProperty('name');
                expect(model).toHaveProperty('description');
                expect(typeof model.id).toBe('string');
                expect(typeof model.name).toBe('string');
                expect(typeof model.description).toBe('string');
            });
        });

        it('should have non-empty names and descriptions', () => {
            const models = getAvailableModels();

            models.forEach(model => {
                expect(model.name.length).toBeGreaterThan(0);
                expect(model.description.length).toBeGreaterThan(0);
            });
        });
    });

    describe('GeminiModel type', () => {
        it('should accept valid model strings', () => {
            const validModels: GeminiModel[] = [
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-2.0-flash-exp',
            ];

            validModels.forEach(model => {
                expect(typeof model).toBe('string');
            });
        });
    });
});
