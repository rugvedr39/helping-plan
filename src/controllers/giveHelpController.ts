import { Model, Sequelize,QueryTypes } from "sequelize";
import { GiveHelp } from "../models/give_help";
import { User } from "../models/User";
const { Op } = require("sequelize");

export const getTransaction = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const transaction = await GiveHelp.findAll({
      where: { sender_id: id },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["name", "mobile_number"],
        },
        {
          model: User,
          as: "Receiver",
          attributes: ["name", "mobile_number"],
        },
      ],
    });
    res.status(200).json(transaction);
  } catch (error) {
    console.log(error);
  }
};

export const updateTransaction = async (req: any, res: any) => {
  const { transactionId, utrNumber } = req.body;
  try {
    const transaction: any = await GiveHelp.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }
    transaction.utrNumber = utrNumber;

    if (transaction.amount == 600.0) {
      transaction.status = "Pending";
      await transaction.save();
    } else {
      transaction.status = "Pending";
      await transaction.save();
    }
    res.status(200).send("UTR Number updated successfully");
  } catch (error) {
    console.error("Failed to update UTR Number:", error);
    res.status(500).send("Error updating UTR Number");
  }
};

export const ReciveTransaction = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const transaction = await GiveHelp.findAll({
      where: { receiver_id: id },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["name", "mobile_number"],
        },
        {
          model: User,
          as: "Receiver",
          attributes: ["name", "mobile_number"],
        },
      ],
    });
    res.status(200).json(transaction);
  } catch (error) {
    console.log(error);
  }
};

export const TransactionComplete = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction: any = await GiveHelp.findByPk(id);
    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }

    transaction.status = "Completed";
    await transaction.save();

    const completedTransactions: any = await GiveHelp.findAll({
      where: {
        sender_id: transaction.sender_id,
        status: "Completed",
      },
    });

    // Filter and limit transactions of 300 to only count the first two
    const transactions300: any = completedTransactions
      .filter((t: any) => parseFloat(t.amount) === 600)
      .slice(0, 3);
    const amount300: any = transactions300.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0,
    );

    // Calculate the total amount including a maximum of two 300 transactions
    const totalAmount: any =
      completedTransactions.reduce(
        (sum, t: any) =>
          sum + (parseFloat(t.amount) !== 600 ? parseFloat(t.amount) : 0),
        0,
      ) + amount300;

    let level = 0;
    if (totalAmount >= 81500) level = 9;
    else if (totalAmount >= 56500) level = 8;
    else if (totalAmount >= 36500) level = 7;
    else if (totalAmount >= 21500) level = 6;
    else if (totalAmount >= 11500) level = 5;
    else if (totalAmount >= 6500) level = 4;
    else if (totalAmount >= 3500) level = 3;
    else if (totalAmount >= 1500) level = 2;
    else if (totalAmount >= 900) level = 1;

    let user: any = await User.findOne({
      where: { id: transaction.sender_id },
    });

    user.level = level;
    if (totalAmount >= 900) {
      user.status = "Active";
    }
    await user.save();

    if (level === 1) {
      console.log("user level is", level);
      const rs300: any = await GiveHelp.findOne({
        where: {
          sender_id: transaction.sender_id,
          amount: 600.0,
          status: "Completed",
          receiver_id: {
            [Op.ne]: 5, // Exclude receiver_id 5
          },
        },
      });
      console.log("whom he  give the 600 means direct", rs300);

      if (rs300 != null) {
        let upline: any = await User.findOne({
          where: { id: rs300.receiver_id },
        });

        upline = await User.findOne({
          where: { id: upline.referred_by },
        });

        await createGiveHelpEntryForUpline(user.id, upline, 600, 1);
      }
    } else {
      let upline: any = await User.findOne({
        where: { id: transaction.receiver_id },
      });

      if (user.level > 1 && user.level < 9) {
        await createGiveHelpEntryForUpline(
          transaction.sender_id,
          upline,
          level === 2
            ? 2000
            : level === 3
              ? 3000
              : level === 4
                ? 5000
                : level === 5
                  ? 10000
                  : level === 6
                    ? 15000
                    : level === 7
                      ? 20000
                      : level === 8
                        ? 25000
                        : 0,
          level,
        );
      }
    }

    res.status(200).json("done");
  } catch (error) {
    console.error("Failed to update UTR Number:", error);
    res.status(500).send("Error updating UTR Number");
  }
};

export const getReferralTree = async (req: any, res: any) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const user: any = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tree = await getBinaryTreeLevels(user.id);
    res.json(tree);
  } catch (error) {
    console.error("Error fetching referral tree:", error);
    res.status(500).json({ message: "Failed to fetch referral tree" });
  }
};

async function getBinaryTreeLevels(userId, maxLevel = 10) {
  const query = `
  WITH RECURSIVE referral_tree AS (
    SELECT
      u1.id,
      u1.name,
      u1.email,
      u1.username,
      u1.mobile_number,
      u1.status,
      u1.referred_by,
      u1.level,
      CAST(NULL AS CHAR(255)) AS referrer_name,
      CAST(NULL AS CHAR(255)) AS referrer_username,
      0 AS tree_level
    FROM Users u1
    WHERE u1.id = :userId
    
    UNION ALL
    
    SELECT
      u2.id,
      u2.name,
      u2.email,
      u2.username,
      u2.mobile_number,
      u2.status,
      u2.referred_by,
      u2.level,
      IFNULL(referrer.name, '') AS referrer_name,
      IFNULL(referrer.username, '') AS referrer_username,
      rt.tree_level + 1
    FROM Users u2
    INNER JOIN referral_tree rt ON u2.referred_by = rt.id
    LEFT JOIN Users referrer ON u2.referred_by = referrer.id
    WHERE rt.tree_level < :maxLevel
  )
  SELECT * FROM referral_tree;
`;

const users = await User.sequelize.query(query, {
  replacements: { userId, maxLevel },
  type: QueryTypes.SELECT,
});

const result = [];
users.forEach((user: any) => {
  if (!result[user.tree_level]) {
    result[user.tree_level] = { level: user.tree_level, count: 0, users: [] };
  }
  result[user.tree_level].count++;
  result[user.tree_level].users.push({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    mobile_number: user.mobile_number,
    status: user.status,
    referred_by: user.referred_by,
    level: user.level,
    referrer_name: user.referrer_name,
    referrer_username: user.referrer_username,
  });
});

return result.filter((level) => level !== null && level.count > 0);
}

export { getBinaryTreeLevels };




// create createGiveHelpEntry
async function createGiveHelpEntry(
  senderId: any,
  receiverId: any,
  amount: any,
  upi: any,
) {
  console.log("in the createGiveHelpEntry");
  await GiveHelp.create({
    sender_id: senderId,
    receiver_id: receiverId,
    amount: amount,
    status: "initiate",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 8),
    upiId: upi,
    utrNumber: "",
  });
}

// end createGiveHelpEntry

const createGiveHelpEntryForUpline = async (
  senderId: any,
  upline: any,
  amount: any,
  level: any,
) => {
  console.log(
    upline,
    "upline in createGiveHelpEntryForUpline checking for upline",
  );
  if (upline && upline.referred_by) {
    const uplineUser: any = await User.findOne({
      where: { id: upline.referred_by },
    });

    console.log("upline refferd by ", uplineUser.referred_by);

    if (uplineUser.level > level) {
      await createGiveHelpEntry(
        senderId,
        uplineUser.id,
        amount,
        uplineUser.upi_number,
      );
    } else {
      await createGiveHelpEntryForUpline(senderId, uplineUser, amount, level);
    }
  } else {
    console.log("default User add entery createGiveHelpEntry");
    const defaultUplineUser: any = await User.findOne({
      where: { id: 5 },
    });
    await createGiveHelpEntry(
      senderId,
      defaultUplineUser.id,
      amount,
      "7499277181@axl",
    );
  }
};
