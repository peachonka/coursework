public class CreateFamilyRequest
    {
        public string RelationshipType { get; set; } = string.Empty;
        public List<string> IncomeTypes { get; set; } = new List<string>();
    }