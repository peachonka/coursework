namespace BudgetApi.Models;
public class Account
{
    public required string Id { get; set; }
    public required string FamilyId { get; set; }
    public AccountType AccountType { get; set; }
    public decimal Balance { get; set; }
}

public enum AccountType
{
    Main,
    Savings,
    Investment,
}