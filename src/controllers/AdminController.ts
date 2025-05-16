import { Request, Response } from "express";
import { User } from "../models/User";
import { Op } from "sequelize";
import { Admin } from "../models/admin.model";

export class AdminController {
  public async listUsers(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const search: string = (req.query.search as string) || "";

    try {
      const users = await User.findAndCountAll({
        where: {
          username: {
            [Op.like]: `%${search}%`,
          },
        },
        include: [
          {
            model: User,
            as: "Referrer",
            attributes: ["username", "name"],
          },
        ],
        order: [["createdAt", "ASC"]],
        offset: (page - 1) * limit,
        limit: limit,
      });

      return res.status(200).json({
        total: users.count,
        totalPages: Math.ceil(users.count / limit),
        currentPage: page,
        users: users.rows,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Error retrieving users",
        error: error.message,
      });
    }
  }

  public async UsersCount(req: Request, res: Response) {
    try {
      const totalUsers = await User.count();
      const totalActiveUsers = await User.count({
        where: { status: "active" },
      });
      const totalNotActiveUsers = await User.count({
        where: { status: "notActive" },
      });
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const totalUserjoinedToday = await User.count({
        where: {
          createdAt: {
            [Op.between]: [startOfToday, endOfToday],
          },
        },
      });
      res.status(200).json({
        totalUsers: totalUsers,
        totalActiveUsers: totalActiveUsers,
        totalNotActiveUsers: totalNotActiveUsers,
        totalUserjoinedToday: totalUserjoinedToday,
      });
    } catch (error) {
      console.error("Error fetching user counts:", error);
      throw error;
    }
  }

  public updateUserDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, mobile_number, upi_number,password } = req.body;

      // Find the user by ID
      const user: any = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user details
      user.name = name || user.name;
      user.mobile_number = mobile_number || user.mobile_number;
      user.upi_number = upi_number || user.upi_number;
      user.password = password || user.password;

      // Save the updated user
      await user.save();

      res.json({ message: "User updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };


public getadminpassWord = async (req, res) => {

  try {
    const user: any = await Admin.findByPk(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    
    res.status(200).json({ password: user.password });
  } catch (error) {
    console.error("Error fetching admin password:", error);
    res.status(500).json({ message: "Error fetching admin password" });
  }
}

public updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user: any = await Admin.findByPk(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password" });
  }
}


public updateAdminDetails = async (req, res) => {
  try {
    const { 
      whatsappGroupUrl,
      zoomMeetingTitle,
      zoomMeetingTime,
      zoomMeetingUrl
    } = req.body;

    const admin: any = await Admin.findByPk(1); // Assuming single admin or ID 1
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (whatsappGroupUrl) admin.whatsappGroupUrl = whatsappGroupUrl;
    if (zoomMeetingTitle) admin.zoomMeetingTitle = zoomMeetingTitle;
    if (zoomMeetingTime) admin.zoomMeetingTime = zoomMeetingTime;
    if (zoomMeetingUrl) admin.zoomMeetingUrl = zoomMeetingUrl;

    await admin.save();
    res.status(200).json({ 
      message: "Admin details updated successfully",
      data: {
        whatsappGroupUrl: admin.whatsappGroupUrl,
        zoomMeetingTitle: admin.zoomMeetingTitle,
        zoomMeetingTime: admin.zoomMeetingTime,
        zoomMeetingUrl: admin.zoomMeetingUrl
      }
    });
  } catch (error) {
    console.error("Error updating admin details:", error);
    res.status(500).json({ message: "Error updating admin details" });
  }
}


public getAdminDetails = async (req, res) => {
  try {
    const admin = await Admin.findByPk(1, {
      attributes: { 
        exclude: ['password','username'] // Don't return password
      }
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Admin details retrieved successfully",
      data: admin
    });
  } catch (error) {
    console.error("Error getting admin details:", error);
    res.status(500).json({ message: "Error getting admin details" });
  }
}

public updateWhatsappGroup = async (req, res) => {
  try {
    const { whatsappGroupUrl } = req.body;

    if (!whatsappGroupUrl) {
      return res.status(400).json({ message: "WhatsApp group URL is required" });
    }

    const admin: any = await Admin.findByPk(1);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.whatsappGroupUrl = whatsappGroupUrl;
    await admin.save();

    res.status(200).json({ 
      message: "WhatsApp group URL updated successfully",
      whatsappGroupUrl: admin.whatsappGroupUrl
    });
  } catch (error) {
    console.error("Error updating WhatsApp group URL:", error);
    res.status(500).json({ message: "Error updating WhatsApp group URL" });
  }
}

public updateZoomDetails = async (req, res) => {
  try {
    const { 
      zoomMeetingTitle,
      zoomMeetingTime, 
      zoomMeetingUrl,
      whatsappGroupUrl 
    } = req.body;

    const admin: any = await Admin.findByPk(1);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (zoomMeetingTitle) admin.zoomMeetingTitle = zoomMeetingTitle;
    if (zoomMeetingTime) admin.zoomMeetingTime = zoomMeetingTime;
    if (zoomMeetingUrl) admin.zoomMeetingUrl = zoomMeetingUrl;
    if (whatsappGroupUrl) admin.whatsappGroupUrl = whatsappGroupUrl;

    await admin.save();

    res.status(200).json({
      message: "Zoom meeting details updated successfully",
      data: {
        zoomMeetingTitle: admin.zoomMeetingTitle,
        zoomMeetingTime: admin.zoomMeetingTime,
        zoomMeetingUrl: admin.zoomMeetingUrl,
        whatsappGroupUrl: admin.whatsappGroupUrl
      }
    });
  } catch (error) {
    console.error("Error updating Zoom details:", error);
    res.status(500).json({ message: "Error updating Zoom details" });
  }
}

}