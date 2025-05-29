// Controllers/ExpensesController.cs
using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExpensesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses(
            [FromQuery] string? memberId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] bool? plannedOnly = null)
        {
            IQueryable<Expense> query = _context.Expenses;

            if (!string.IsNullOrEmpty(memberId))
                query = query.Where(e => e.FamilyMemberId == memberId);

            if (startDate.HasValue)
                query = query.Where(e => e.Date >= startDate);

            if (endDate.HasValue)
                query = query.Where(e => e.Date <= endDate);

            if (plannedOnly.HasValue)
                query = query.Where(e => e.IsPlanned == plannedOnly);

            return await query.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Expense>> PostExpense([FromBody] ExpenseDto expenseDto)
        {
            var expense = new Expense
            {
                Id = Guid.NewGuid().ToString(),
                Amount = expenseDto.Amount,
                Category = expenseDto.Category,
                Date = expenseDto.Date,
                FamilyMemberId = expenseDto.FamilyMemberId,
                Description = expenseDto.Description ?? string.Empty,
                IsPlanned = expenseDto.IsPlanned
            };
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpenses), new { id = expense.Id }, expense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(string id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

public class ExpenseDto
{
    public required string Id { get; set; }
    public required decimal Amount { get; set; }
    public required string Category { get; set; } // "food", "clothing"
    public required DateTime Date { get; set; }
    public required string FamilyMemberId { get; set; }
    public string? Description { get; set; }
    public required bool IsPlanned { get; set; }
}