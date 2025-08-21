/**
 * DOM manipulation utilities
 */

/**
 * Create a DOM element with specified attributes
 * @param {string} tagName - HTML tag name
 * @param {object} attributes - Element attributes
 * @param {string} innerHTML - Inner HTML content
 * @returns {HTMLElement} Created element
 */
export function createElement(
    tagName: string, 
    attributes: Record<string, string> = {}, 
    innerHTML: string = ''
): HTMLElement {
    const element = document.createElement(tagName);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style') {
            element.setAttribute('style', value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    
    return element;
}

/**
 * Safely get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement | null} Element or null if not found
 */
export function getElementById(id: string): HTMLElement | null {
    return document.getElementById(id);
}

/**
 * Safely query selector
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element | null} Element or null if not found
 */
export function querySelector(selector: string, parent: Element | Document = document): Element | null {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return null;
    }
}

/**
 * Safely query all elements
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {NodeListOf<Element>} NodeList of elements
 */
export function querySelectorAll(selector: string, parent: Element | Document = document): NodeListOf<Element> {
    try {
        return parent.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return document.querySelectorAll(''); // Return empty NodeList
    }
}

/**
 * Add event listener with error handling
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {boolean} useCapture - Use capture phase
 */
export function addEventListener(
    element: Element, 
    event: string, 
    handler: EventListener, 
    useCapture: boolean = false
): void {
    try {
        element.addEventListener(event, handler, useCapture);
    } catch (error) {
        console.error('Failed to add event listener:', error);
    }
}

/**
 * Remove event listener with error handling
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {boolean} useCapture - Use capture phase
 */
export function removeEventListener(
    element: Element, 
    event: string, 
    handler: EventListener, 
    useCapture: boolean = false
): void {
    try {
        element.removeEventListener(event, handler, useCapture);
    } catch (error) {
        console.error('Failed to remove event listener:', error);
    }
}

/**
 * Set CSS styles on element
 * @param {HTMLElement} element - Target element
 * @param {object} styles - Style properties
 */
export function setStyles(element: HTMLElement, styles: Record<string, string>): void {
    Object.entries(styles).forEach(([property, value]) => {
        try {
            element.style.setProperty(property, value);
        } catch (error) {
            console.warn(`Failed to set style ${property}: ${value}`, error);
        }
    });
}

/**
 * Append element to parent with error handling
 * @param {Element} parent - Parent element
 * @param {Element} child - Child element to append
 */
export function appendChild(parent: Element, child: Element): void {
    try {
        parent.appendChild(child);
    } catch (error) {
        console.error('Failed to append child element:', error);
    }
}

/**
 * Prepend element to parent with error handling
 * @param {Element} parent - Parent element
 * @param {Element} child - Child element to prepend
 */
export function prependChild(parent: Element, child: Element): void {
    try {
        parent.insertBefore(child, parent.firstChild);
    } catch (error) {
        console.error('Failed to prepend child element:', error);
    }
}

/**
 * Remove element safely
 * @param {Element} element - Element to remove
 */
export function removeElement(element: Element): void {
    try {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    } catch (error) {
        console.error('Failed to remove element:', error);
    }
}
