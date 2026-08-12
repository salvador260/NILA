const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const VALID_STATUSES = [
    "سفارش جدید",
    "در حال آماده‌سازی",
    "ارسال شد",
    "تحویل داده شد",
    "لغو شد"
];


// صفحه اصلی بک‌اند
app.get("/", (req, res) => {
    res.send("Backend سایت NILA فعال است ✅");
});


// ثبت سفارش
app.post("/order", async (req, res) => {

    console.log("ORDER RECEIVED:");
    console.log(req.body);

    const order = {
        ...req.body,
        status: "سفارش جدید",
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {

        await db.insert(order);

        console.log("ORDER SAVED");

        res.json({
            message: "سفارش با موفقیت ذخیره شد",
            order: order
        });

    } catch (err) {

        console.log("DATABASE ERROR:", err);

        res.status(500).json({
            error: "خطا در ذخیره سفارش",
            details: err.message
        });

    }
});


// همه سفارش‌ها
app.get("/orders", async (req, res) => {

    try {

        const orders = await db.find({}).sort({
            createdAt: -1
        });

        res.json(orders);

    } catch (err) {

        console.log("DATABASE ERROR:", err);

        res.status(500).json({
            error: "خطا در دریافت سفارش‌ها"
        });

    }
});


// سفارش‌های یک مشتری با شماره موبایل
app.get("/orders/customer/:phone", async (req, res) => {

    try {

        const phone = req.params.phone;

        const orders = await db.find({
            phone: phone
        }).sort({
            createdAt: -1
        });

        res.json(orders);

    } catch (err) {

        console.log("CUSTOMER ORDERS ERROR:", err);

        res.status(500).json({
            error: "خطا در دریافت سابقه سفارش‌ها"
        });

    }
});


// تغییر وضعیت سفارش
app.put("/orders/:id", async (req, res) => {

    try {

        const id = req.params.id;
        const status = req.body.status;

        if (!VALID_STATUSES.includes(status)) {

            return res.status(400).json({
                error: "وضعیت نامعتبر است"
            });
        }

        const updatedOrder = await db.update(
            { _id: id },
            {
                $set: {
                    status: status,
                    updatedAt: new Date()
                }
            },
            { returnUpdatedDocs: true }
        );

        res.json({
            message: "وضعیت سفارش تغییر کرد",
            order: updatedOrder
        });

    } catch (err) {

        console.log("STATUS ERROR:", err);

        res.status(500).json({
            error: "خطا در تغییر وضعیت"
        });

    }
});


// حذف سفارش
app.delete("/orders/:id", async (req, res) => {

    try {

        const id = req.params.id;

        await db.remove(
            { _id: id },
            {}
        );

        res.json({
            message: "سفارش حذف شد"
        });

    } catch (err) {

        console.log("DELETE ERROR:", err);

        res.status(500).json({
            error: "خطا در حذف سفارش"
        });

    }
});


// اجرای سرور
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});