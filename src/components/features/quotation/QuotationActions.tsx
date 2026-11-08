interface QuotationActionsProps {
  onAccept: () => void;
  onReject: () => void;
}

export default function QuotationActions({
  onAccept,
  onReject,
}: QuotationActionsProps) {
  return (
    <div className="flex gap-2">
      <button type="button" className="btn btn-success" onClick={onAccept}>
        Accept Quotation
      </button>
      <button type="button" className="btn btn-danger" onClick={onReject}>
        Reject
      </button>
    </div>
  );
}
