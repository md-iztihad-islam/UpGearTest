import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Invoices are drawn straight into the HTTP response — nothing is written to
// disk or uploaded anywhere. Several orders can go into one PDF; each invoice
// starts on a new page and long orders continue onto extra pages.

const LOGO_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "../assets/upgearlogo.png");
const HAS_LOGO = fs.existsSync(LOGO_PATH);

const PAGE = { left: 40, right: 555, bottom: 790 };
const FOOTER_Y = 615; // terms + parcel cut-out live below this on an invoice's last page
const TABLE_COLUMNS = { warranty: 255, qty: 350, unitPrice: 395, total: 480 };

const PAYMENT_LABELS = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    cash: "Cash",
    nagad: "Nagad",
    card: "Card",
    bank: "Bank Transfer",
};

const text = (value) => (value === null || value === undefined || value === "" ? "N/A" : String(value).trim());
const amount = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dhaka" })
        : "N/A";

// Orders store one row per unit; the invoice shows one row per product with
// its quantity and all of its serial numbers.
const groupLines = (orderProducts = []) => {
    const lines = new Map();
    orderProducts.forEach((unit) => {
        const key = `${unit.productId}:${unit.purchasePrice}`;
        if (!lines.has(key)) {
            lines.set(key, {
                name: unit.product?.title || unit.productId,
                subTitle: unit.product?.subTitle,
                warranty: unit.product?.group?.warranty?.title || "Standard",
                mainPrice: Number(unit.originalPrice) || 0,
                discount: Number(unit.discountAmount) || 0,
                unitPrice: Number(unit.purchasePrice) || 0,
                quantity: 0,
                serials: [],
            });
        }
        const line = lines.get(key);
        line.quantity += 1;
        if (unit.serialNumber) line.serials.push(unit.serialNumber);
    });
    return [...lines.values()];
};

function drawHeader(doc) {
    if (HAS_LOGO) doc.image(LOGO_PATH, PAGE.left, 30, { width: 120 });
    doc.fillColor("#444444").font("Helvetica").fontSize(26).text("INVOICE", 400, 40, { width: 155, align: "right" });
    doc.moveTo(PAGE.left, 85).lineTo(PAGE.right, 85).lineWidth(1).stroke("#DDDDDD");
}

function drawField(doc, label, value, x, y, width = 160) {
    doc.fillColor("#777777").font("Helvetica-Bold").fontSize(8).text(label.toUpperCase(), x, y, { width });
    doc.fillColor("#000000").font("Helvetica").fontSize(10).text(text(value), x, y + 12, { width });
}

function drawTableHeader(doc, y) {
    doc.lineWidth(1);
    doc.rect(PAGE.left, y, PAGE.right - PAGE.left, 22).fillAndStroke("#F9F9F9", "#888888");
    Object.values(TABLE_COLUMNS).forEach((x) => doc.moveTo(x, y).lineTo(x, y + 22).stroke("#888888"));

    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(9);
    doc.text("PRODUCT DESCRIPTION", 50, y + 7);
    doc.text("WARRANTY", TABLE_COLUMNS.warranty + 10, y + 7);
    doc.text("QTY", TABLE_COLUMNS.qty + 5, y + 7, { width: 35, align: "center" });
    doc.text("UNIT PRICE", TABLE_COLUMNS.unitPrice + 10, y + 7, { width: 70, align: "right" });
    doc.text("TOTAL", TABLE_COLUMNS.total + 5, y + 7, { width: 65, align: "right" });
    return y + 22;
}

// Height a product row will take, so it can be moved to a new page whole.
function measureLine(doc, line) {
    const title = line.subTitle ? `${line.name} (${line.subTitle})` : line.name;
    doc.font("Helvetica-Bold").fontSize(10);
    let descHeight = doc.heightOfString(title, { width: 195 }) + 3;
    if (line.serials.length) {
        doc.font("Helvetica").fontSize(8);
        descHeight += doc.heightOfString(`S/N: ${line.serials.join(", ")}`, { width: 195 }) + 5;
    }
    const priceHeight = line.discount > 0 ? 32 : 12;
    return { title, height: Math.max(descHeight, priceHeight, 30) };
}

function drawLine(doc, line, title, startY) {
    let descY = startY;
    doc.fillColor("#333333").font("Helvetica-Bold").fontSize(10).text(title, 50, descY, { width: 195 });
    descY += doc.heightOfString(title, { width: 195 }) + 3;

    if (line.serials.length) {
        doc.fillColor("#666666").font("Helvetica").fontSize(8).text(`S/N: ${line.serials.join(", ")}`, 50, descY, { width: 195 });
    }

    doc.fillColor("#666666").font("Helvetica").fontSize(10).text(line.warranty, TABLE_COLUMNS.warranty + 10, startY, { width: 85 });
    doc.fillColor("#333333").text(String(line.quantity), TABLE_COLUMNS.qty + 5, startY, { width: 35, align: "center" });

    let priceY = startY;
    if (line.discount > 0) {
        doc.fillColor("#999999").fontSize(8)
            .text(amount(line.mainPrice), TABLE_COLUMNS.unitPrice + 10, priceY, { width: 70, align: "right", strike: true });
        priceY += 10;
        doc.fillColor("#CC0000").fontSize(8)
            .text(`-${amount(line.discount)}`, TABLE_COLUMNS.unitPrice + 10, priceY, { width: 70, align: "right" });
        priceY += 10;
    }
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10)
        .text(amount(line.unitPrice), TABLE_COLUMNS.unitPrice + 10, priceY, { width: 70, align: "right" });

    doc.font("Helvetica").text(amount(line.unitPrice * line.quantity), TABLE_COLUMNS.total + 5, startY, { width: 65, align: "right" });
}

function drawTotals(doc, order, y) {
    const labelX = 380;
    const valueX = 470;
    const row = (label, value, color = "#000000") => {
        doc.font("Helvetica").fontSize(10).fillColor("#777777").text(label, labelX, y, { width: 95 });
        doc.fillColor(color).text(value, valueX, y, { width: 85, align: "right" });
        y += 18;
    };

    row("Subtotal:", amount(order.subTotal));
    row("Delivery:", `+${amount(order.deliveryCharge)}`);
    if (Number(order.discount) > 0) {
        row(order.coupon?.code ? `Discount (${order.coupon.code}):` : "Discount:", `-${amount(order.discount)}`, "#CC0000");
    }

    y += 4;
    doc.rect(labelX - 5, y - 5, 180, 26).fill("#F9F9F9");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(12).text("TOTAL:", labelX, y);
    doc.text(`${amount(order.totalBill)} BDT`, 450, y, { width: 105, align: "right" });
    y += 30;

    const paid = Number(order.paidAmount) || 0;
    const due = Number(order.dueAmount) || 0;
    if (paid > 0) row("Paid:", amount(paid));
    if (due > 0 && order.orderStatus !== "CANCELED") row("Due:", amount(due), "#CC0000");

    return y;
}

function drawFooterAndParcelSlip(doc, order) {
    doc.moveTo(PAGE.left, FOOTER_Y).lineTo(PAGE.right, FOOTER_Y).lineWidth(0.8).stroke("#1A1A1A");
    if (HAS_LOGO) doc.image(LOGO_PATH, 465, FOOTER_Y + 15, { width: 70 });

    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10).text("Terms & Conditions:", PAGE.left, FOOTER_Y + 15);
    doc.fillColor("#555555").font("Helvetica").fontSize(8)
        .text("1. All items are subject to the warranty policies mentioned in the invoice.", PAGE.left, FOOTER_Y + 30)
        .text("2. Complete warranty terms and claim procedures are available on our official website.", PAGE.left, FOOTER_Y + 40)
        .text("3. This original invoice must be presented for any future support or warranty claims.", PAGE.left, FOOTER_Y + 50);

    // Parcel cut-out
    const cutY = 692;
    doc.moveTo(20, cutY).lineTo(575, cutY).dash(5, { space: 4 }).lineWidth(1).stroke("#AAAAAA");
    doc.undash();
    doc.rect(250, cutY - 6, 95, 12).fill("#FFFFFF");
    doc.fillColor("#888888").font("Helvetica").fontSize(8).text("CUT HERE", 250, cutY - 4, { width: 95, align: "center" });

    const slipY = 712;
    if (HAS_LOGO) doc.image(LOGO_PATH, PAGE.left, slipY, { width: 120 });

    const x = 200;
    const slipRow = (label, value, y) => {
        doc.fillColor("#000000").font("Helvetica-Bold").fontSize(15).text(label, x, y);
        doc.font("Helvetica").text(text(value), x + 85, y, { width: 270, lineBreak: false, ellipsis: true });
    };
    slipRow("Order ID:", `#${order.orderId}`, slipY);
    slipRow("Phone:", order.customer?.phone, slipY + 23);

    const due = Number(order.dueAmount) || 0;
    slipRow(
        due > 0 ? "Collect:" : "Payment:",
        due > 0 ? `${amount(due)} BDT` : "Paid",
        slipY + 46
    );
}

// New page for an invoice that doesn't fit on one; labelled so loose pages
// from a combined PDF can't get mixed up. Returns the y to continue at.
function startContinuationPage(doc, order) {
    doc.addPage();
    doc.fillColor("#777777").font("Helvetica").fontSize(9)
        .text(`Invoice #${order.orderId} (continued)`, PAGE.left, 30, { width: PAGE.right - PAGE.left, align: "right" });
    return 50;
}

function drawInvoice(doc, order) {
    drawHeader(doc);

    let y = 110;
    drawField(doc, "Invoice For", order.customer?.name, PAGE.left, y);
    drawField(doc, "Invoice Number", `#${order.orderId}`, 220, y);
    drawField(doc, "Date", formatDate(order.createdAt), 400, y);

    y += 50;
    drawField(doc, "Delivery Address", order.deliveryAddress, PAGE.left, y, 340);
    drawField(doc, "Region", order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka", 400, y);

    y += 50;
    drawField(doc, "Contact Number", order.customer?.phone, PAGE.left, y);
    drawField(doc, "Payment Method", PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod, 220, y);
    drawField(doc, "Sold By", order.store?.title || "UpGear Online", 400, y);

    y = drawTableHeader(doc, y + 60);

    for (const line of groupLines(order.orderProducts)) {
        const { title, height } = measureLine(doc, line);
        if (y + 10 + height > PAGE.bottom) {
            y = drawTableHeader(doc, startContinuationPage(doc, order));
        }
        const startY = y + 10;
        drawLine(doc, line, title, startY);
        y = startY + height;
        doc.moveTo(PAGE.left, y).lineTo(PAGE.right, y).lineWidth(0.5).stroke("#EEEEEE");
    }

    // Totals (~130pt) must end above FOOTER_Y, where the terms and parcel slip
    // go. If they don't fit, both move to the top of a fresh page together.
    if (y + 145 > FOOTER_Y) {
        y = startContinuationPage(doc, order);
    }
    drawTotals(doc, order, y + 15);
    drawFooterAndParcelSlip(doc, order);
}

/**
 * Streams a PDF with one invoice per order (in the given order) to `res`.
 * The caller must have checked that `orders` is non-empty.
 */
export const streamInvoicesPdf = (res, orders, filename) => {
    const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: { Title: filename.replace(/\.pdf$/, ""), Author: "UpGear" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    doc.pipe(res);

    orders.forEach((order, index) => {
        if (index > 0) doc.addPage();
        drawInvoice(doc, order);
    });

    doc.end();
};
