import React from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, Edit, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const QuoteTable = ({ quotes, customers, onEdit, onUpdateStatus, onConvertToSale, onDelete }) => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}};

  const getCustomerName = (customerId) => customers.find(c => c.id === customerId)?.name || "Unknown";

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                  <motion.tr key={quote.id} variants={itemVariants} className="border-b hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-500 mr-2" />{quote.title}
                      </div>
                    </TableCell>
                    <TableCell>{getCustomerName(quote.customerId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />{new Date(quote.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>${quote.total?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell><span className={`status-badge status-${quote.status}`}>{quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}</span></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(quote)} title="Edit Quote"><Edit className="h-4 w-4 text-amber-500" /></Button>
                        {quote.status === 'draft' && <Button variant="ghost" size="icon" onClick={() => onUpdateStatus(quote.id, 'sent')} title="Send"><Send className="h-4 w-4 text-blue-500" /></Button>}
                        {quote.status === 'sent' && (<>
                          <Button variant="ghost" size="icon" onClick={() => onUpdateStatus(quote.id, 'accepted')} title="Accept"><CheckCircle className="h-4 w-4 text-green-500" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => onUpdateStatus(quote.id, 'declined')} title="Decline"><XCircle className="h-4 w-4 text-red-500" /></Button>
                        </>)}
                        {quote.status === 'accepted' && <Button variant="ghost" size="sm" onClick={() => onConvertToSale(quote.id)} className="text-xs">Convert to Sale</Button>}
                        <Button variant="ghost" size="icon" onClick={() => onDelete(quote)} title="Delete"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (<TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No quotes found.</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuoteTable;