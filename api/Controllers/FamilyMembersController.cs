using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FamilyMembersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FamilyMembersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/familymembers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyMember>>> GetFamilyMembers()
        {
            return await _context.FamilyMembers.ToListAsync();
        }

        // POST: api/familymembers
        [HttpPost]
        public async Task<ActionResult<FamilyMember>> PostFamilyMember(FamilyMember member)
        {
            _context.FamilyMembers.Add(member);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFamilyMembers), new { id = member.Id }, member);
        }

        // DELETE: api/familymembers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamilyMember(string id)
        {
            var member = await _context.FamilyMembers.FindAsync(id);
            if (member == null) return NotFound();

            _context.FamilyMembers.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}