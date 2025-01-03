import i18nManager from '../common/i18n.js';
import { BaseWidget } from './BaseWidget.js';

export class CalculatorWidget extends BaseWidget {
    constructor() {
        super();
        this.type = 'calculator';
        this.title = i18nManager.t('calculator.title');
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetScreen = false;
        
        this.buttons = [
            [
                { text: 'C', value: 'C', class: 'operator' },
                { text: '⌫', value: 'backspace', class: 'operator' },
                { text: '÷', value: '/', class: 'operator' },
                { text: '×', value: '*', class: 'operator' }
            ],
            [
                { text: '7', value: '7' },
                { text: '8', value: '8' },
                { text: '9', value: '9' },
                { text: '-', value: '-', class: 'operator' }
            ],
            [
                { text: '4', value: '4' },
                { text: '5', value: '5' },
                { text: '6', value: '6' },
                { text: '+', value: '+', class: 'operator' }
            ],
            [
                { text: '1', value: '1' },
                { text: '2', value: '2' },
                { text: '3', value: '3' },
                { text: '=', value: '=', class: 'operator equals', rowspan: 2 }
            ],
            [
                { text: '0', value: '0', class: 'zero', colspan: 2 },
                { text: '.', value: '.' }
            ]
        ];
    }

    render() {
        this.container.innerHTML = `
            <div class="calculator-widget">
                <div class="calculator-screen">
                    <div class="previous-operand">${this.previousValue}</div>
                    <div class="current-operand">${this.currentValue}</div>
                </div>
                <div class="calculator-buttons">
                    ${this.buttons.map(row => `
                        <div class="button-row">
                            ${row.map(button => `
                                <button class="calculator-button ${button.class || ''}" 
                                        data-value="${button.value}"
                                        type="button">
                                    ${button.text}
                                </button>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 获取显示元素的引用
        this.previousOperandEl = this.container.querySelector('.previous-operand');
        this.currentOperandEl = this.container.querySelector('.current-operand');
    }

    attachEventListeners() {
        // 使用事件委托
        const buttonsContainer = this.container.querySelector('.calculator-buttons');
        if (!buttonsContainer) return;

        buttonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.calculator-button');
            if (!button) return;

            const value = button.dataset.value;
            if (!value) return;

            switch (value) {
                case 'C':
                    this.clear();
                    break;
                case 'backspace':
                    this.backspace();
                    break;
                case '=':
                    this.calculate();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                    this.handleOperator(value);
                    break;
                case '.':
                    this.appendDecimal();
                    break;
                default:
                    this.appendNumber(value);
                    break;
            }
            this.updateDisplay();
        });
    }

    appendNumber(number) {
        if (this.shouldResetScreen || this.currentValue === '0') {
            this.currentValue = number;
            this.shouldResetScreen = false;
        } else {
            this.currentValue += number;
        }
    }

    appendDecimal() {
        if (this.shouldResetScreen) {
            this.currentValue = '0';
            this.shouldResetScreen = false;
        }
        if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
    }

    handleOperator(operator) {
        if (!this.currentValue && !this.previousValue) return;

        if (this.operation && this.previousValue && this.currentValue) {
            this.calculate();
        }

        this.operation = operator;
        this.previousValue = this.currentValue || this.previousValue;
        this.currentValue = '';
        this.shouldResetScreen = false;
    }

    calculate() {
        if (!this.operation || !this.previousValue || !this.currentValue) return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.clear();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        this.currentValue = this.formatResult(result);
        this.operation = null;
        this.previousValue = '';
        this.shouldResetScreen = true;
    }

    formatResult(number) {
        if (isNaN(number) || !isFinite(number)) {
            return '错误';
        }

        const stringNumber = number.toString();
        if (stringNumber.length > 12) {
            return number.toExponential(6);
        }

        // 处理小数点后的零
        if (stringNumber.includes('.')) {
            return parseFloat(number.toFixed(8)).toString();
        }

        return stringNumber;
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetScreen = false;
    }

    backspace() {
        if (this.currentValue.length <= 1) {
            this.currentValue = '0';
        } else {
            this.currentValue = this.currentValue.slice(0, -1);
        }
    }

    updateDisplay() {
        // 格式化当前显示的数字
        this.currentOperandEl.textContent = this.currentValue || '0';

        if (this.operation) {
            const operatorSymbol = this.operation === '*' ? '×' : 
                                 this.operation === '/' ? '÷' : 
                                 this.operation;
            this.previousOperandEl.textContent = `${this.previousValue} ${operatorSymbol}`;
        } else {
            this.previousOperandEl.textContent = this.previousValue;
        }
    }
} 