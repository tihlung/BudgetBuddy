// Transaction class
class Transaction {
    constructor(id, description, amount, type, category) {
        this.id = id;
        this.description = description;
        this.amount = parseFloat(amount);
        this.type = type; // 'income' or 'expense'
        this.category = category;
        this.date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Budget Tracker App
class BudgetTracker {
    constructor() {
        this.transactions = [];
        this.loadTransactions();
        this.initializeEventListeners();
        this.updateUI();
    }

    // Load transactions from localStorage
    loadTransactions() {
        const saved = localStorage.getItem('budgetTransactions');
        if (saved) {
            this.transactions = JSON.parse(saved);
        }
    }

    // Save transactions to localStorage
    saveTransactions() {
        localStorage.setItem('budgetTransactions', JSON.stringify(this.transactions));
    }

    // Add a new transaction
    addTransaction(description, amount, type, category) {
        if (!description || !amount || amount <= 0) {
            alert('Please enter valid description and amount');
            return false;
        }

        const id = Date.now().toString();
        const transaction = new Transaction(id, description, amount, type, category);
        
        this.transactions.push(transaction);
        this.saveTransactions();
        this.updateUI();
        
        return true;
    }

    // Delete a transaction
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.updateUI();
        }
    }

    // Clear all transactions
    clearAllTransactions() {
        if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
            this.transactions = [];
            this.saveTransactions();
            this.updateUI();
        }
    }

    // Calculate totals
    calculateTotals() {
        let totalIncome = 0;
        let totalExpense = 0;

        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        return {
            totalIncome,
            totalExpense,
            balance
        };
    }

    // Filter transactions
    getFilteredTransactions(filterType = 'all') {
        if (filterType === 'all') {
            return this.transactions;
        }
        return this.transactions.filter(t => t.type === filterType);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Form submission
        const form = document.getElementById('transactionForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const description = document.getElementById('description').value.trim();
            const amount = parseFloat(document.getElementById('amount').value);
            const type = document.getElementById('type').value;
            const category = document.getElementById('category').value;
            
            if (this.addTransaction(description, amount, type, category)) {
                form.reset();
                document.getElementById('description').focus();
            }
        });

        // Filter change
        const filterSelect = document.getElementById('filterType');
        filterSelect.addEventListener('change', () => {
            this.updateUI();
        });

        // Clear all button
        const clearBtn = document.getElementById('clearAllBtn');
        clearBtn.addEventListener('click', () => {
            this.clearAllTransactions();
        });
    }

    // Update the UI
    updateUI() {
        const totals = this.calculateTotals();
        const filterType = document.getElementById('filterType').value;
        const filteredTransactions = this.getFilteredTransactions(filterType);

        // Update balance and totals
        document.getElementById('balanceAmount').textContent = `$${totals.balance.toFixed(2)}`;
        document.getElementById('totalIncome').textContent = `$${totals.totalIncome.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `$${totals.totalExpense.toFixed(2)}`;

        // Update monthly summary
        document.getElementById('monthlyIncome').textContent = `$${totals.totalIncome.toFixed(2)}`;
        document.getElementById('monthlyExpense').textContent = `$${totals.totalExpense.toFixed(2)}`;
        document.getElementById('netBalance').textContent = `$${totals.balance.toFixed(2)}`;

        // Update transaction list
        const transactionsList = document.getElementById('transactionsList');
        const emptyMessage = document.getElementById('emptyMessage');

        if (filteredTransactions.length === 0) {
            emptyMessage.style.display = 'block';
            transactionsList.innerHTML = '<p class="empty-message">No transactions found</p>';
        } else {
            emptyMessage.style.display = 'none';
            transactionsList.innerHTML = '';

            // Sort by date (newest first)
            const sortedTransactions = [...filteredTransactions].sort((a, b) => b.id - a.id);

            sortedTransactions.forEach(transaction => {
                const transactionElement = this.createTransactionElement(transaction);
                transactionsList.appendChild(transactionElement);
            });
        }

        // Update balance color
        const balanceAmount = document.getElementById('balanceAmount');
        if (totals.balance >= 0) {
            balanceAmount.style.color = '#28a745';
        } else {
            balanceAmount.style.color = '#dc3545';
        }
    }

    // Create transaction element
    createTransactionElement(transaction) {
        const div = document.createElement('div');
        div.className = `transaction-item ${transaction.type}`;
        div.dataset.id = transaction.id;

        const categoryIcons = {
            'food': '🍔',
            'transport': '🚗',
            'shopping': '🛍️',
            'entertainment': '🎬',
            'bills': '💡',
            'salary': '💰',
            'other': '📝'
        };

        div.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-description">
                    ${categoryIcons[transaction.category] || '📝'} ${transaction.description}
                </div>
                <div class="transaction-meta">
                    <span>${transaction.category}</span>
                    <span>•</span>
                    <span>${transaction.date}</span>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </div>
            <button class="delete-btn" onclick="budgetTracker.deleteTransaction('${transaction.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;

        return div;
    }
}

// Initialize the app when page loads
let budgetTracker;
document.addEventListener('DOMContentLoaded', () => {
    budgetTracker = new BudgetTracker();
    
    // Add some sample data if empty
    if (budgetTracker.transactions.length === 0) {
        const sampleTransactions = [
            ['Salary Deposit', 2500, 'income', 'salary'],
            ['Grocery Shopping', 125.75, 'expense', 'food'],
            ['Electricity Bill', 85.50, 'expense', 'bills'],
            ['Freelance Work', 500, 'income', 'salary'],
            ['Movie Tickets', 35, 'expense', 'entertainment']
        ];

        // Add sample transactions with delay for demo effect
        let delay = 0;
        sampleTransactions.forEach(([desc, amount, type, category]) => {
            setTimeout(() => {
                budgetTracker.addTransaction(desc, amount, type, category);
            }, delay);
            delay += 300;
        });
    }
});