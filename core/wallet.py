import time, uuid


def now():
    return time.strftime("%Y-%m-%d %H:%M:%S")


class VirtualWallet:
    def __init__(self, starting_balance=10000.0):
        self.starting_balance = float(starting_balance)
        self.balance = float(starting_balance)
        self.ledger = []

    def add_ledger(self, kind, amount, note, txid=None):
        self.ledger.insert(0, {
            "id": txid or ("LED-" + uuid.uuid4().hex[:10].upper()),
            "time": now(), "kind": kind, "amount": round(amount, 2),
            "balance": round(self.balance, 2), "note": note
        })

    def debit(self, amount, note, txid=None):
        amount = float(amount)
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self.balance:
            raise ValueError("insufficient virtual balance")
        self.balance = round(self.balance - amount, 2)
        self.add_ledger("BET", -amount, note, txid)

    def credit(self, amount, note):
        amount = float(amount)
        if amount <= 0:
            return
        self.balance = round(self.balance + amount, 2)
        self.add_ledger("WIN", amount, note)

    def reset(self):
        self.balance = self.starting_balance
        self.ledger.clear()
