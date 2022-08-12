import axios from "axios";
import React, { useEffect, useState } from "react";
import DesktopTransaction from "../../components/desktop/DesktopTransaction";
import { getTransactionsByMonth, Transaction } from "../../server-api";

const DesktopCalendarPage = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const now = new Date();
        const resp = await getTransactionsByMonth(
          now.getMonth() + 1,
          now.getFullYear()
        );

        if (resp.status !== 200) {
          return;
        }

        setTransactions(resp.data);
      } catch (err) {
        if (!axios.isAxiosError(err)) {
          return;
        }
      }
    };

    void fetchApi();
  }, []);

  return (
    <div>
      <h2>Calendar Desktop</h2>
      <button onClick={() => setShowTransactionModal(!showTransactionModal)}>
        Toggle
      </button>
      <DesktopTransaction
        open={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transaction={
          transactions.length > 0 ? transactions[transactions.length - 1] : null
        }
      />
    </div>
  );
};

export default DesktopCalendarPage;
