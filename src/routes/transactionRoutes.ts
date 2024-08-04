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
import { User } from "../models/User";
const router = express.Router();
router.get("/get-transaction/:id", getTransaction);
router.get("/recive-transaction/:id", ReciveTransaction);
router.post("/post-completed", updateTransaction);
router.get("/transaction-completed/:id", TransactionComplete);
router.get("/tree/:id", getReferralTree);

router.get("/top-receivers", async (req:any, res) => {
  const excludedIds = [5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;

  try {
    const topReceivers = await GiveHelp.findAll({
      where: {
        status: "Completed",
        receiver_id: {
          [Op.notIn]: excludedIds,
        },
      },
      attributes: [
        "receiver_id",
        [sequelize.fn("SUM", sequelize.col("amount")), "total_received"],
      ],
      group: ["receiver_id", "Receiver.id", "Receiver.name", "Receiver.username", "Receiver.mobile_number"],
      order: [[sequelize.literal("total_received"), "DESC"]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: User,
          as: "Receiver",
          attributes: ["id", "name", "username", "mobile_number"],
        },
      ],
      subQuery: false,
    });

    const totalCount = await GiveHelp.count({
      distinct: true,
      col: 'receiver_id',
      where: {
        status: "Completed",
        receiver_id: {
          [Op.notIn]: excludedIds,
        },
      },
    });

    res.json({
      users: topReceivers,
      totalCount: totalCount,
      currentPage: page,
      pageSize: pageSize,
    });
  } catch (error) {
    console.error("Failed to fetch top receivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
