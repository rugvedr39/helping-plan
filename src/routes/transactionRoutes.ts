import express from "express";
import {
  getTransaction,
  updateTransaction,
  ReciveTransaction,
  TransactionComplete,
  getReferralTree,
} from "../controllers/giveHelpController";
const { Op } = require("sequelize");
import { GiveHelp } from "../models/give_help";
import { sequelize } from "../config/database";
const router = express.Router();
router.get("/get-transaction/:id", getTransaction);
router.get("/recive-transaction/:id", ReciveTransaction);
router.post("/post-completed", updateTransaction);
router.get("/transaction-completed/:id", TransactionComplete);
router.get("/tree/:id", getReferralTree);

router.get("/top-receivers", async (req:any, res:any) => {
  const excludedIds = [5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const topReceivers = await GiveHelp.findAndCountAll({
      where: {
        status: "Completed",
        receiver_id: {
          [Op.notIn]: excludedIds,
        },
      },
      attributes: [
        "receiver_id",
        [sequelize.fn("sum", sequelize.col("amount")), "total_received"],
      ],
      group: "receiver_id",
      order: [[sequelize.col("total_received"), "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          association: "Receiver",
          attributes: ["name", "username", "mobile_number"],
        },
      ],
    });

    res.json({
      users: topReceivers.rows,
      totalCount: topReceivers.count.length,
      currentPage: page,
      pageSize: pageSize,
    });
  } catch (error) {
    console.error("Failed to fetch top receivers:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
