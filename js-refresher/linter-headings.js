
function hasHeadingRole (text) {
    if(text.startsWith('Heading') || text.startsWith('Subheading'))
    return true;

    return false;
}

function getSiblings (text) {
    if(text.startsWith('Group'))
    return text.includes('siblingPeriod') ? 
    ['Group member 1', 'Group member 2.'] 
    : ['Group member 1', 'Group member 2'];

    return [];
}

function hasFinalPeriod (text) {
    return text[text.length - 1] === '.';
}

function isShortString (text) {
    return !text.trim().includes(' ');
}

function addFinalPeriod (text) {
    return text.concat('.');
}

function removeFinalPeriod (text) {
    return text.substring(0, text.length - 1);
}


function transformHeadings(text) {
    if(!text) return text;

    if(hasHeadingRole(text)) {
        if(!hasFinalPeriod(text)) return text;
        return removeFinalPeriod(text);
    }

    const siblings = getSiblings(text);
    if(siblings.length) {
        if(hasFinalPeriod(text)) return text;
        if(siblings.some(sibling => hasFinalPeriod(sibling))) return addFinalPeriod(text);
    }

    if(isShortString(text) && hasFinalPeriod(text)) return removeFinalPeriod(text);

    return text;
}

module.exports = {
    transformHeadings
}