const { transformHeadings } = require('../linter-headings');

describe('linter-headings', () => {

    // Valid
    describe('Valid', () => {
        it('should transform non text values properly', () => {
            expect(transformHeadings('')).toBe('');
            expect(transformHeadings(null)).toBeNull();
            expect(transformHeadings()).toBeUndefined();
        });
    
        it('should transform Heading without final period properly', () => {
            expect(transformHeadings('Heading Nice title')).toBe('Heading Nice title');
        });
    
        it('should transform Sub-Heading without final period properly', () => {
            expect(transformHeadings('Subheading Nice sub title')).toBe('Subheading Nice sub title');
        });
    
        it('should transform Non Heading without final period properly', () => {
            expect(transformHeadings('Text Nice paragraph ordinary text')).toBe('Text Nice paragraph ordinary text');
        });
    
        it('should transform Non Heading with final period properly', () => {
            expect(transformHeadings('Text Nice paragraph ordinary text.')).toBe('Text Nice paragraph ordinary text.');
        });
    
        it('should transform Non Heading group member with final period properly', () => {
            expect(transformHeadings('Group Nice paragraph ordinary text.')).toBe('Group Nice paragraph ordinary text.');
        });

        it('should transform Non Heading short string without final period properly', () => {
            expect(transformHeadings('Short')).toBe('Short');
        });

        
    });

    
    // Invalid
    describe('Invalid', () => {
        it('should transform Heading with final period properly', () => {
            expect(transformHeadings('Heading Nice title.')).toBe('Heading Nice title');
        });

        it('should transform Non Heading group member without final period and has some sibling with final period properly', () => {
            expect(transformHeadings('Group Nice paragraph ordinary text siblingPeriod')).toBe('Group Nice paragraph ordinary text siblingPeriod.');
        });

        it('should transform Non Heading group member without final period and has no sibling with final period properly', () => {
            expect(transformHeadings('Group Nice paragraph ordinary text')).toBe('Group Nice paragraph ordinary text');
        });

        it('should transform Non Heading short string with final period properly', () => {
            expect(transformHeadings('Short.')).toBe('Short');
        });


    });
});